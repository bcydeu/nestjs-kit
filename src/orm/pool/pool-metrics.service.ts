import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';
import { PoolMonitorService } from './pool-monitor.service';

/**
 * Database Pool Metrics를 Prometheus로 수집하는 서비스
 */
@Injectable()
export class PoolMetricsService implements OnModuleInit {
  private readonly logger = new Logger(PoolMetricsService.name);
  private intervalId?: NodeJS.Timeout;

  constructor(
    private readonly poolMonitor: PoolMonitorService,
    @InjectMetric('db_pool_total_connections')
    private readonly totalConnectionsGauge: Gauge<string>,
    @InjectMetric('db_pool_active_connections')
    private readonly activeConnectionsGauge: Gauge<string>,
    @InjectMetric('db_pool_idle_connections')
    private readonly idleConnectionsGauge: Gauge<string>,
    @InjectMetric('db_pool_waiting_requests')
    private readonly waitingRequestsGauge: Gauge<string>,
  ) {}

  onModuleInit() {
    // 10초마다 pool 상태 수집
    this.startMetricsCollection();
  }

  /**
   * 메트릭 수집 시작
   */
  startMetricsCollection() {
    this.logger.log('Starting DB pool metrics collection');

    this.intervalId = setInterval(async () => {
      await this.updateMetrics();
    }, 10000); // 10초마다 업데이트
  }

  /**
   * 메트릭 수집 중지
   */
  stopMetricsCollection() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.logger.log('Stopped DB pool metrics collection');
    }
  }

  /**
   * 메트릭 업데이트
   */
  async updateMetrics() {
    try {
      const status = await this.poolMonitor.getPoolStatus();

      if (status) {
        this.totalConnectionsGauge.set(status.totalConnections);
        this.activeConnectionsGauge.set(status.activeConnections);
        this.idleConnectionsGauge.set(status.idleConnections);
        this.waitingRequestsGauge.set(status.waitingRequests);
      }
    } catch (error) {
      this.logger.error('Failed to update pool metrics', error);
    }
  }

  /**
   * 수동으로 현재 상태 조회
   */
  async getCurrentStatus() {
    return this.poolMonitor.getPoolStatus();
  }
}
