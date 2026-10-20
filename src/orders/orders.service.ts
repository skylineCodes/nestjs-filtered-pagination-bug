import { Injectable, Logger } from '@nestjs/common';
import { ListOrdersQueryDto, SortOrder } from './list-orders.query';
import { Order } from './order.types';
import { orders } from './data/mock-order';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  async findAll(query: ListOrdersQueryDto) {
    this.logger.log(`Executing findAll with filters: ${JSON.stringify(query)}`);
    
    let filtered = [...orders];

    const totalItems = filtered?.length;
    const totalPages = Math.ceil(totalItems / query.limit) || 1;

    const offset = (query.page - 1) * query.limit;
    let paginatedItems = filtered?.slice(offset, offset + query.limit);

    // 1. Status Filter
    if (query.status) {
      filtered = filtered.filter((o) => o.status === query.status);
    }

    // 2. Search Filter (Customer or ID)
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.customer.toLowerCase().includes(searchLower) ||
          o.id,
      );
    }

    // 3. Date Range Filter (The source of complex edge cases)
    if (query.startDate) {
      const start = new Date(query.startDate).getTime();
      filtered = filtered.filter((o) => new Date(o.createdAt).getTime() >= start);
    }
    if (query.endDate) {
      const end = new Date(query.endDate).getTime();
      filtered = filtered.filter((o) => new Date(o.createdAt).getTime() <= end);
    }

    // 4. Sorting Logic
    filtered.sort((a, b) => {
      let valA: any = a[query.sortBy];
      let valB: any = b[query.sortBy];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return query.sortOrder === SortOrder.ASC ? -1 : 1;
      if (valA > valB) return query.sortOrder === SortOrder.ASC ? 1 : -1;
      return 0;
    });

    // 5. Pagination calculation (Fixed Bug: slicing AFTER filtering ensures correct metadata)
    // const totalItems = filtered.length;
    // const totalPages = Math.ceil(totalItems / query.limit) || 1;
    // const offset = (query.page - 1) * query.limit;
    // const paginatedItems = filtered.slice(offset, offset + query.limit);

    return {
      data: paginatedItems,
      meta: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    };
  }
}