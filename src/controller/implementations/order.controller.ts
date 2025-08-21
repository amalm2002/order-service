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

    async getAllRestaurantOrders(restaurantOrdersQuery: GetAllRestaurantOrdersDto): Promise<RestaurantOrderResponseDto> {
        return await this._orderService.getAllRestaurantOrder(restaurantOrdersQuery);
    }

    async getDashboardStats(dashboardStatsQuery: DashboardStatsDto): Promise<DashboardStatsResponseDto> {
        return await this._orderService.getDashboardStats(dashboardStatsQuery);
    }

    async changeTheOrderStatus(orderStatusUpdate: ChangeOrderStatusDto): Promise<ChangeOrderStatusResponseDto> {
        return await this._orderService.changeTheOrderStatus(orderStatusUpdate)
    }

    async getUserOrders(userOrdersQuery: GetUserOrdersDto): Promise<GetUserOrdersResponseDto> {
        return await this._orderService.getUserOrder(userOrdersQuery)
    }

    async getOrderDetails(orderDetailsQuery: GetOrderDetailsDto): Promise<GetOrderDetailsResponseDto> {
        return await this._orderService.getOrderDetails(orderDetailsQuery)
    }

    async getOrderDetail(orderDetailsQuery: GetOrderDetailsDto): Promise<GetOrderDetailsResponseDto> {
        return await this._orderService.getOrderDetail(orderDetailsQuery)
    }

    async cancelOrder(cancelOrderRequest: CancelOrderDto): Promise<CancelOrderResponseDto> {
        return await this._orderService.cancelOrder(cancelOrderRequest)
    }

    async verifyOrderNumber(verifyOrderRequest: VerifyOrderNumberDto): Promise<VerifyOrderNumberResponseDto> {
        return await this._orderService.verifyOrderNumber(verifyOrderRequest)
    }

    async completeDelivery(deliveryCompletionRequest: CompleteDeliveryDto): Promise<CompleteDeliveryResponseDto> {
        return await this._orderService.completeDelivery(deliveryCompletionRequest)
    }

    async getDeliveryPartnerOrders(deliveryPartnerOrdersQuery: GetDeliveryPartnerOrdersDto): Promise<GetDeliveryPartnerOrdersResponseDto> {
        return await this._orderService.getDeliveryPartnerOrders(deliveryPartnerOrdersQuery)
    }

    async createCashOnDeliveryOrder(cashOnDeliveryOrder: CreateOrderDTO): Promise<CreateOrderResponseDTO> {
        return await this._orderService.createCashOnDeliveryOrder(cashOnDeliveryOrder);
    }

    async createUPIOrder(upiOrder: CreateOrderDTO): Promise<CreateOrderResponseDTO> {
        return await this._orderService.createUPIOrder(upiOrder)
    }
}