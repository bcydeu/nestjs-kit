import { Module } from '@nestjs/common';
import { PoolMonitorService } from './pool-monitor.service';
import { PoolMetricsService } from './pool-metrics.service';
import { dbPoolMetrics } from './pool-monitor.service';

@Module({
  providers: [
    PoolMonitorService,
    PoolMetricsService,
    dbPoolMetrics.totalConnections,
    dbPoolMetrics.activeConnections,
    dbPoolMetrics.idleConnections,
    dbPoolMetrics.waitingRequests,
  ],
  exports: [PoolMonitorService, PoolMetricsService],
})
export class PoolMonitorModule {}
