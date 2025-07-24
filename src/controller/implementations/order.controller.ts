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


export class OrderController implements IOrderController {
    private service: IOrderService;

    constructor(service: IOrderService) {
        this.service = service;
    }

    // async createOrder(data: CreateOrderDto): Promise<any> {
    //     return await this.service.createOrder(data);
    // }

    // async verifyPayment(data: VerifyPaymentDto): Promise<any> {
    //     return await this.service.verifyPayment(data);
    // }

    // async placeOrder(data: PlaceOrderDto): Promise<any> {
    //     return await this.service.placeOrder(data);
    // }

    async getAllRestaurantOrders(data: GetAllRestaurantOrdersDto): Promise<RestaurantOrderResponseDto> {
        return await this.service.getAllRestaurantOrder(data);
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

    async cancelOrder(data: CancelOrderDto): Promise<CancelOrderResponseDto> {
        return await this.service.cancelOrder(data)
    }

    async updateDeliveryBoy(data: UpdateDeliveryBoyDto): Promise<UpdateDeliveryBoyResponseDto> {
        return await this.service.updateDeliveryBoy(data);
    }

    async removeDeliveryBoy(data: RemoveDeliveryBoyDto): Promise<RemoveDeliveryBoyResponseDto> {
        return await this.service.removeDeliveryBoy(data);
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