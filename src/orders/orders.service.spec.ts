import { OrdersService } from './orders.service';
import { ListOrdersQuery } from './list-orders.query';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(() => {
    service = new OrdersService();
  });

  it('returns the requested page when no status filter is supplied', () => {
    const result = service.list({ page: 1, pageSize: 2 } as ListOrdersQuery);

    expect(result.data.map((order) => order.id)).toEqual([101, 102]);
    expect(result.meta).toEqual({
      page: 1,
      pageSize: 2,
      total: 9,
      totalPages: 5,
    });
  });

  it('supports a later unfiltered page', () => {
    const result = service.list({ page: 2, pageSize: 2 } as ListOrdersQuery);

    expect(result.data.map((order) => order.id)).toEqual([103, 104]);
  });
});
