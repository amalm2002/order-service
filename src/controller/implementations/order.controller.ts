import { IOrderController } from '../interfaces/order.controller.interface';
import { IOrderService } from '../../services/interfaces/order.service.interface';
import { CreateOrderDTO, CreateOrderResponseDTO } from '../../dto/create.order.dto';
import { VerifyPaymentDto } from '../../dto/verify-payment.dto';
import { PlaceOrderDto } from '../../dto/place-order.dto';
import { GetAllRestaurantOrdersDto, RestaurantOrderResponseDto } from '../../dto/get-all-restaurant-orders.dto';
import { ChangeOrderStatusDto, ChangeOrderStatusResponseDto } from '../../dto/change-order-status.dto';
import { GetUserOrdersDto, GetUserOrdersResponseDto } from '../../dto/get-user-orders.dto';
import { GetOrderDetailsDto, GetOrderDetailsResponseDto } from '../../dto/get-order-details.dto';
import { CancelOrderDto, CancelOrderResponseDto } from '../../dto/cancel-order.dto';
import { UpdateDeliveryBoyDto, UpdateDeliveryBoyResponseDto } from '../../dto/update-delivery-boy.dto';
import { RemoveDeliveryBoyDto, RemoveDeliveryBoyResponseDto } from '../../dto/remove-delivery-boy.dto';
import { VerifyOrderNumberDto, VerifyOrderNumberResponseDto } from '../../dto/verify-order-number.dto';
import { CompleteDeliveryDto, CompleteDeliveryResponseDto } from '../../dto/complete-delivery.dto';
import { GetDeliveryPartnerOrdersDto, GetDeliveryPartnerOrdersResponseDto } from '../../dto/get-delivery-partner-orders.dto';
import { DashboardStatsDto, DashboardStatsResponseDto } from '../../dto/dashboard-stats.dto';


export class OrderController implements IOrderController {
    private service: IOrderService;

    constructor(service: IOrderService) {
        this.service = service;
    }

    async getAllRestaurantOrders(data: GetAllRestaurantOrdersDto): Promise<RestaurantOrderResponseDto> {
        return await this.service.getAllRestaurantOrder(data);
    }

    async getDashboardStats(data: DashboardStatsDto): Promise<DashboardStatsResponseDto> {
        return await this.service.getDashboardStats(data);
    }

    async changeTheOrderStatus(data: ChangeOrderStatusDto): Promise<ChangeOrderStatusResponseDto> {
        return await this.service.changeTheOrderStatus(data)
    }

    async getUserOrders(data: GetUserOrdersDto): Promise<GetUserOrdersResponseDto> {
        return await this.service.getUserOrder(data)
    }

    async getOrderDetails(data: GetOrderDetailsDto): Promise<GetOrderDetailsResponseDto> {
        return await this.service.getOrderDetails(data)
    }
    async getOrderDetail(data: GetOrderDetailsDto): Promise<GetOrderDetailsResponseDto> {
        return await this.service.getOrderDetail(data)
    }

    async cancelOrder(data: CancelOrderDto): Promise<CancelOrderResponseDto> {
        return await this.service.cancelOrder(data)
    }

    async verifyOrderNumber(data: VerifyOrderNumberDto): Promise<VerifyOrderNumberResponseDto> {
        return await this.service.verifyOrderNumber(data)
    }

    async completeDelivery(data: CompleteDeliveryDto): Promise<CompleteDeliveryResponseDto> {
        return await this.service.completeDelivery(data)
    }

    async getDeliveryPartnerOrders(data: GetDeliveryPartnerOrdersDto): Promise<GetDeliveryPartnerOrdersResponseDto> {
        return await this.service.getDeliveryPartnerOrders(data)
    }

    async createCashOnDeliveryOrder(data: CreateOrderDTO): Promise<CreateOrderResponseDTO> {
        return await this.service.createCashOnDeliveryOrder(data);
    }

    async createUPIOrder(data: CreateOrderDTO): Promise<CreateOrderResponseDTO> {
        return await this.service.createUPIOrder(data)
    }
}