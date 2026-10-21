import { OrdersService } from './orders.service';
import { ListOrdersQueryDto, OrderStatus, SortField, SortOrder } from './list-orders.query';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(() => {
    service = new OrdersService();
  });

  it('returns the requested page when no status filter is supplied', async () => {
    const query = {
      page: 1,
      limit: 2,
      sortBy: SortField.CREATED_AT,
      sortOrder: SortOrder.DESC
    }

    const result = await service.findAll(query);

    expect(result.data.map((order) => order.id)).toEqual([60, 59]);
    expect(result.meta).toEqual({
      "page": 1,
      "limit": 2,
      "totalItems": 60,
      "totalPages": 30,
      "hasNextPage": true,
      "hasPreviousPage": false
    });
  });

  it('supports a status filter when supplied', async () => {
    const query = {
      page: 1,
      limit: 2,
      status: OrderStatus.PENDING,
      sortBy: SortField.CREATED_AT,
      sortOrder: SortOrder.DESC
    }

    const result = await service.findAll(query);

    expect(result.data.map((order) => order.id)).toEqual([60, 56]);
  });
});
