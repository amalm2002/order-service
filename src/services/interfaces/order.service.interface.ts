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

export interface IOrderService {
    getAllRestaurantOrder(restaurantOrdersQuery: GetAllRestaurantOrdersDto): Promise<RestaurantOrderResponseDto>;
    getDashboardStats(dashboardStatsQuery: DashboardStatsDto): Promise<DashboardStatsResponseDto>; 
    changeTheOrderStatus(orderStatusUpdate: ChangeOrderStatusDto): Promise<ChangeOrderStatusResponseDto>;
    getUserOrder(userOrdersQuery: GetUserOrdersDto): Promise<GetUserOrdersResponseDto>;
    getOrderDetails(orderDetailsQuery: GetOrderDetailsDto): Promise<GetOrderDetailsResponseDto>;
    getOrderDetail(orderDetailsQuery: GetOrderDetailsDto): Promise<GetOrderDetailsResponseDto>;
    cancelOrder(cancelOrderRequest: CancelOrderDto): Promise<CancelOrderResponseDto>;
    verifyOrderNumber(verifyOrderRequest: VerifyOrderNumberDto): Promise<VerifyOrderNumberResponseDto>;
    completeDelivery(deliveryCompletionRequest: CompleteDeliveryDto): Promise<CompleteDeliveryResponseDto>
    getDeliveryPartnerOrders(deliveryPartnerOrdersQuery: GetDeliveryPartnerOrdersDto): Promise<GetDeliveryPartnerOrdersResponseDto>
    createCashOnDeliveryOrder(cashOnDeliveryOrder: CreateOrderDTO): Promise<CreateOrderResponseDTO>;
    createUPIOrder(upiOrder: CreateOrderDTO): Promise<CreateOrderResponseDTO>
}