import { Injectable, Logger } from '@nestjs/common';
import { ListOrdersQueryDto, OrderStatus, SortOrder } from './list-orders.query';
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

  async getOrderStatistics(query: ListOrdersQueryDto) {
    this.logger.log(`Executing getOrderStatistics with filters: ${JSON.stringify(query)}`);

    const targetOrders = orders; 

    const totalRevenue = targetOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const averageOrderValue = targetOrders.length ? totalRevenue / targetOrders.length : 0;

    const byStatus = {
      PENDING: targetOrders.filter((o) => o.status === OrderStatus.PENDING).length,
      PROCESSING: targetOrders.filter((o) => o.status === OrderStatus.PROCESSING).length,
      COMPLETED: targetOrders.filter((o) => o.status === OrderStatus.COMPLETED).length,
      CANCELLED: targetOrders.filter((o) => o.status === OrderStatus.CANCELLED).length,
    };

    return {
      filteredCount: targetOrders.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      byStatus,
    };
  }

  // async getOrderStatistics(query: ListOrdersQueryDto) {
  //   this.logger.log(`Executing getOrderStatistics with filters: ${JSON.stringify(query)}`);

  //   let filtered = [...orders];

  //   // 1. Apply Status Filter
  //   if (query.status) {
  //     filtered = filtered.filter((o) => o.status === query.status);
  //   }

  //   // 2. Apply Search Filter
  //   if (query.search) {
  //     const searchLower = query.search.toLowerCase();
  //     filtered = filtered.filter(
  //       (o) =>
  //         o.customer.toLowerCase().includes(searchLower) ||
  //         String(o.id).includes(searchLower),
  //     );
  //   }

  //   // 3. Apply Date Range Filter
  //   if (query.startDate) {
  //     const start = new Date(query.startDate).getTime();
  //     filtered = filtered.filter((o) => new Date(o.createdAt).getTime() >= start);
  //   }
  //   if (query.endDate) {
  //     const end = new Date(query.endDate).getTime();
  //     filtered = filtered.filter((o) => new Date(o.createdAt).getTime() <= end);
  //   }

  //   const totalRevenue = filtered.reduce((sum, o) => sum + o.totalAmount, 0);
  //   const averageOrderValue = filtered.length ? totalRevenue / filtered.length : 0;

  //   const byStatus = {
  //     PENDING: filtered.filter((o) => o.status === OrderStatus.PENDING).length,
  //     PROCESSING: filtered.filter((o) => o.status === OrderStatus.PROCESSING).length,
  //     COMPLETED: filtered.filter((o) => o.status === OrderStatus.COMPLETED).length,
  //     CANCELLED: filtered.filter((o) => o.status === OrderStatus.CANCELLED).length,
  //   };

  //   return {
  //     filteredCount: filtered.length,
  //     totalRevenue: Number(totalRevenue.toFixed(2)),
  //     averageOrderValue: Number(averageOrderValue.toFixed(2)),
  //     byStatus,
  //   };
  // }
}