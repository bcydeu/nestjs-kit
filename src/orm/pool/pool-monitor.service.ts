import { Injectable, Logger } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

interface PoolInternal {
  totalCount?: number;
  idleCount?: number;
  waitingCount?: number;
  min?: number;
  max?: number;
}

/**
 * Database Connection Pool 모니터링 서비스
 *
 * Pool 상태를 추적하고 Prometheus 메트릭으로 노출합니다.
 */
@Injectable()
export class PoolMonitorService {
  private readonly logger = new Logger(PoolMonitorService.name);

  constructor(private readonly orm: MikroORM) {}

  /**
   * 현재 Pool 상태 조회
   */
  async getPoolStatus() {
    try {
      const connection = this.orm.em.getConnection();
      // mikro-orm Connection 타입에 driver-internal client/pool이 노출되지 않음
      const pool = (connection as unknown as { client?: { pool?: PoolInternal } }).client?.pool;

      if (!pool) {
        this.logger.warn('Pool information not available');
        return null;
      }

      return {
        totalConnections: pool.totalCount || 0,
        idleConnections: pool.idleCount || 0,
        activeConnections: (pool.totalCount || 0) - (pool.idleCount || 0),
        waitingRequests: pool.waitingCount || 0,
        poolConfig: {
          min: pool.min || 0,
          max: pool.max || 0,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get pool status', error);
      return null;
    }
  }

  /**
   * Pool 상태를 로그로 출력
   */
  async logPoolStatus() {
    const status = await this.getPoolStatus();
    if (status) {
      this.logger.log(
        `DB Pool Status - Total: ${status.totalConnections}, Active: ${status.activeConnections}, Idle: ${status.idleConnections}, Waiting: ${status.waitingRequests}`,
      );
    }
  }
}

/**
 * Prometheus Gauge 메트릭 정의
 */
export const dbPoolMetrics = {
  totalConnections: makeGaugeProvider({
    name: 'db_pool_total_connections',
    help: 'Total number of database connections in the pool',
  }),
  activeConnections: makeGaugeProvider({
    name: 'db_pool_active_connections',
    help: 'Number of active database connections',
  }),
  idleConnections: makeGaugeProvider({
    name: 'db_pool_idle_connections',
    help: 'Number of idle database connections',
  }),
  waitingRequests: makeGaugeProvider({
    name: 'db_pool_waiting_requests',
    help: 'Number of requests waiting for a connection',
  }),
};
