import { Controller, Get, Query } from '@nestjs/common';
import { ListOrdersQueryDto } from './list-orders.query';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Query() query: ListOrdersQueryDto) {
    return this.ordersService.findAll(query);
  }
}
