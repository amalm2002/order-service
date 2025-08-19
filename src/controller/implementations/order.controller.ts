import { IOrderController } from '../interfaces/order.controller.interface';
import { IOrderService } from '../../services/interfaces/order.service.interface';
import { CreateOrderDTO, CreateOrderResponseDTO } from '../../dto/create.order.dto';
import { GetAllRestaurantOrdersDto, RestaurantOrderResponseDto } from '../../dto/get-all-restaurant-orders.dto';
import { ChangeOrderStatusDto, ChangeOrderStatusResponseDto } from '../../dto/change-order-status.dto';
import { GetUserOrdersDto, GetUserOrdersResponseDto } from '../../dto/get-user-orders.dto';
import { GetOrderDetailsDto, GetOrderDetailsResponseDto } from '../../dto/get-order-details.dto';
import { CancelOrderDto, CancelOrderResponseDto } from '../../dto/cancel-order.dto';
import { VerifyOrderNumberDto, VerifyOrderNumberResponseDto } from '../../dto/verify-order-number.dto';
import { CompleteDeliveryDto, CompleteDeliveryResponseDto } from '../../dto/complete-delivery.dto';
import { GetDeliveryPartnerOrdersDto, GetDeliveryPartnerOrdersResponseDto } from '../../dto/get-delivery-partner-orders.dto';
import { DashboardStatsDto, DashboardStatsResponseDto } from '../../dto/dashboard-stats.dto';


export class OrderController implements IOrderController {

    constructor(
        private readonly _orderService: IOrderService
    ) { }

    async getAllRestaurantOrders(data: GetAllRestaurantOrdersDto): Promise<RestaurantOrderResponseDto> {
        return await this._orderService.getAllRestaurantOrder(data);
    }

    async getDashboardStats(data: DashboardStatsDto): Promise<DashboardStatsResponseDto> {
        return await this._orderService.getDashboardStats(data);
    }

    async changeTheOrderStatus(data: ChangeOrderStatusDto): Promise<ChangeOrderStatusResponseDto> {
        return await this._orderService.changeTheOrderStatus(data)
    }

    async getUserOrders(data: GetUserOrdersDto): Promise<GetUserOrdersResponseDto> {
        return await this._orderService.getUserOrder(data)
    }

    async getOrderDetails(data: GetOrderDetailsDto): Promise<GetOrderDetailsResponseDto> {
        return await this._orderService.getOrderDetails(data)
    }
    async getOrderDetail(data: GetOrderDetailsDto): Promise<GetOrderDetailsResponseDto> {
        return await this._orderService.getOrderDetail(data)
    }

    async cancelOrder(data: CancelOrderDto): Promise<CancelOrderResponseDto> {
        return await this._orderService.cancelOrder(data)
    }

    async verifyOrderNumber(data: VerifyOrderNumberDto): Promise<VerifyOrderNumberResponseDto> {
        return await this._orderService.verifyOrderNumber(data)
    }

    async completeDelivery(data: CompleteDeliveryDto): Promise<CompleteDeliveryResponseDto> {
        return await this._orderService.completeDelivery(data)
    }

    async getDeliveryPartnerOrders(data: GetDeliveryPartnerOrdersDto): Promise<GetDeliveryPartnerOrdersResponseDto> {
        return await this._orderService.getDeliveryPartnerOrders(data)
    }

    async createCashOnDeliveryOrder(data: CreateOrderDTO): Promise<CreateOrderResponseDTO> {
        return await this._orderService.createCashOnDeliveryOrder(data);
    }

    async createUPIOrder(data: CreateOrderDTO): Promise<CreateOrderResponseDTO> {
        return await this._orderService.createUPIOrder(data)
    }
}