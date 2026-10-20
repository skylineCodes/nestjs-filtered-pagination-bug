import { OrderStatus } from "./list-orders.query";

export interface Order {
  id: number;
  customer: string;
  status: OrderStatus;
  totalAmount: number;
  amount: number;
  createdAt: string
}

export interface PaginatedOrders {
  data: Order[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
