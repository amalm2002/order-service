import { CreateOrderDTO, CreateOrderResponseDTO } from '../../dto/create.order.dto';
import { VerifyPaymentDto } from '../../dto/verify-payment.dto';
import { PlaceOrderDto } from '../../dto/place-order.dto';
import { IOrder } from '../../models/interfaces/order.interface';
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

export interface IOrderService {
    getAllRestaurantOrder(data: GetAllRestaurantOrdersDto): Promise<RestaurantOrderResponseDto>;

    getDashboardStats(data: DashboardStatsDto): Promise<DashboardStatsResponseDto>;
    
    changeTheOrderStatus(data: ChangeOrderStatusDto): Promise<ChangeOrderStatusResponseDto>;
    getUserOrder(data: GetUserOrdersDto): Promise<GetUserOrdersResponseDto>;
    getOrderDetails(data: GetOrderDetailsDto): Promise<GetOrderDetailsResponseDto>;
    getOrderDetail(data: GetOrderDetailsDto): Promise<GetOrderDetailsResponseDto>;
    cancelOrder(data: CancelOrderDto): Promise<CancelOrderResponseDto>;
    verifyOrderNumber(data: VerifyOrderNumberDto): Promise<VerifyOrderNumberResponseDto>;
    completeDelivery(data: CompleteDeliveryDto): Promise<CompleteDeliveryResponseDto>
    getDeliveryPartnerOrders(data: GetDeliveryPartnerOrdersDto): Promise<GetDeliveryPartnerOrdersResponseDto>
    createCashOnDeliveryOrder(data: CreateOrderDTO): Promise<CreateOrderResponseDTO>;
    createUPIOrder(data: CreateOrderDTO): Promise<CreateOrderResponseDTO>
}