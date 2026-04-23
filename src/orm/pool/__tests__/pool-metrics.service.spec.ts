import { Gauge } from 'prom-client';
import { PoolMetricsService } from '../pool-metrics.service';
import { PoolMonitorService } from '../pool-monitor.service';

function fakeGauge(): jest.Mocked<Gauge<string>> {
  return { set: jest.fn() } as unknown as jest.Mocked<Gauge<string>>;
}

describe('PoolMetricsService', () => {
  let poolMonitor: jest.Mocked<PoolMonitorService>;
  let totalG: ReturnType<typeof fakeGauge>;
  let activeG: ReturnType<typeof fakeGauge>;
  let idleG: ReturnType<typeof fakeGauge>;
  let waitingG: ReturnType<typeof fakeGauge>;
  let service: PoolMetricsService;

  beforeEach(() => {
    poolMonitor = {
      getPoolStatus: jest.fn(),
    } as unknown as jest.Mocked<PoolMonitorService>;
    totalG = fakeGauge();
    activeG = fakeGauge();
    idleG = fakeGauge();
    waitingG = fakeGauge();

    service = new PoolMetricsService(
      poolMonitor,
      totalG as unknown as Gauge<string>,
      activeG as unknown as Gauge<string>,
      idleG as unknown as Gauge<string>,
      waitingG as unknown as Gauge<string>,
    );
  });

  afterEach(() => {
    service.stopMetricsCollection();
  });

  describe('updateMetrics', () => {
    it('getPoolStatus 결과를 4개 Gauge에 set 한다', async () => {
      poolMonitor.getPoolStatus.mockResolvedValue({
        totalConnections: 10,
        activeConnections: 3,
        idleConnections: 7,
        waitingRequests: 1,
        poolConfig: { min: 2, max: 20 },
      });

      await service.updateMetrics();

      expect(totalG.set).toHaveBeenCalledWith(10);
      expect(activeG.set).toHaveBeenCalledWith(3);
      expect(idleG.set).toHaveBeenCalledWith(7);
      expect(waitingG.set).toHaveBeenCalledWith(1);
    });

    it('getPoolStatus가 null이면 어떤 gauge도 set하지 않는다', async () => {
      poolMonitor.getPoolStatus.mockResolvedValue(null);

      await service.updateMetrics();

      expect(totalG.set).not.toHaveBeenCalled();
      expect(activeG.set).not.toHaveBeenCalled();
    });

    it('에러가 나도 예외를 던지지 않는다', async () => {
      poolMonitor.getPoolStatus.mockRejectedValueOnce(new Error('boom'));

      await expect(service.updateMetrics()).resolves.toBeUndefined();
    });
  });

  describe('getCurrentStatus', () => {
    it('PoolMonitorService.getPoolStatus를 그대로 위임한다', async () => {
      const stub = {
        totalConnections: 1,
        activeConnections: 1,
        idleConnections: 0,
        waitingRequests: 0,
        poolConfig: { min: 0, max: 1 },
      };
      poolMonitor.getPoolStatus.mockResolvedValue(stub);

      const result = await service.getCurrentStatus();
      expect(result).toBe(stub);
    });
  });

  describe('startMetricsCollection / stopMetricsCollection', () => {
    it('start는 setInterval을 설정하고 stop은 해제한다', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      service.startMetricsCollection();

      expect(setIntervalSpy).toHaveBeenCalled();

      service.stopMetricsCollection();

      expect(clearIntervalSpy).toHaveBeenCalled();

      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });
  });
});
