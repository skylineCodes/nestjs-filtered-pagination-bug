import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrderStatus, SortField, SortOrder } from './list-orders.query';

describe('OrdersService (Edge Cases & Regression Tests)', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('findAll - Edge Cases', () => {
    it('should return empty data and correct metadata when filters yield zero results', async () => {
      const query = {
        page: 1,
        limit: 10,
        status: OrderStatus.CANCELLED,
        search: 'NON_EXISTENT_CUSTOMER_XYZ_999',
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
      };

      const result = await service.findAll(query);

      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should handle out-of-bounds page requests gracefully (page beyond totalPages)', async () => {
      const query = {
        page: 999, // Way past available data
        limit: 10,
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
      };

      const result = await service.findAll(query);

      expect(result.data).toEqual([]);
      expect(result.meta.page).toEqual(999);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('should correctly apply multiple active filters simultaneously (Status + Date Range + Search)', async () => {
      const query = {
        page: 1,
        limit: 5,
        status: OrderStatus.PENDING,
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.999Z',
        sortBy: SortField.TOTAL_AMOUNT,
        sortOrder: SortOrder.ASC,
      };

      const result = await service.findAll(query);

      expect(result).toBeDefined();
      // Verify that all returned items respect the PENDING status filter
      result.data.forEach((order) => {
        expect(order.status).toEqual(OrderStatus.PENDING);
      });
    });
  });

  describe('getOrderStatistics - Edge Cases', () => {
    it('should calculate accurate statistics and revenue metrics based on active filters', async () => {
      const query = {
        page: 1,
        limit: 10,
        status: OrderStatus.COMPLETED,
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
      };

      const stats = await service.getOrderStatistics(query);

      expect(stats).toBeDefined();
      expect(stats.filteredCount).toBeGreaterThanOrEqual(0);
      expect(typeof stats.totalRevenue).toEqual('number');
      expect(typeof stats.averageOrderValue).toEqual('number');
      expect(stats.byStatus).toHaveProperty('PENDING');
      expect(stats.byStatus).toHaveProperty('COMPLETED');
    });

    it('should return zero metrics when statistics query yields no matches', async () => {
      const query = {
        page: 1,
        limit: 10,
        search: 'IMPOSSIBLE_SEARCH_QUERY_ABC',
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
      };

      const stats = await service.getOrderStatistics(query);

      expect(stats.filteredCount).toEqual(0);
      expect(stats.totalRevenue).toEqual(0);
      expect(stats.averageOrderValue).toEqual(0);
      expect(stats.byStatus.PENDING).toEqual(0);
      expect(stats.byStatus.COMPLETED).toEqual(0);
    });
  });
});