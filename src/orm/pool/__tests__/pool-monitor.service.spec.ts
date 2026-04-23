import { Test, TestingModule } from '@nestjs/testing';
import { PoolMonitorService } from '../pool-monitor.service';
import { MikroORM } from '@mikro-orm/core';

describe('PoolMonitorService', () => {
  let service: PoolMonitorService;
  let mockPool: {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
    min: number;
    max: number;
  };
  let mockOrm: { em: { getConnection: jest.Mock } };

  beforeEach(async () => {
    mockPool = {
      totalCount: 10,
      idleCount: 7,
      waitingCount: 0,
      min: 2,
      max: 10,
    };

    mockOrm = {
      em: {
        getConnection: jest.fn().mockReturnValue({
          client: { pool: mockPool },
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PoolMonitorService, { provide: MikroORM, useValue: mockOrm }],
    }).compile();

    service = module.get<PoolMonitorService>(PoolMonitorService);
  });

  describe('getPoolStatus()', () => {
    it('pool 상태를 올바르게 반환해야 한다', async () => {
      const status = await service.getPoolStatus();

      expect(status).toEqual({
        totalConnections: 10,
        idleConnections: 7,
        activeConnections: 3,
        waitingRequests: 0,
        poolConfig: { min: 2, max: 10 },
      });
    });

    it('pool이 없는 경우 null을 반환해야 한다', async () => {
      mockOrm.em.getConnection.mockReturnValue({ client: {} });

      const status = await service.getPoolStatus();
      expect(status).toBeNull();
    });

    it('예외 발생 시 null을 반환해야 한다', async () => {
      mockOrm.em.getConnection.mockImplementation(() => {
        throw new Error('Connection error');
      });

      const status = await service.getPoolStatus();
      expect(status).toBeNull();
    });
  });

  describe('logPoolStatus()', () => {
    it('에러 없이 실행되어야 한다', async () => {
      await expect(service.logPoolStatus()).resolves.not.toThrow();
    });
  });
});
