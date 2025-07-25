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

export interface IOrderController {
    // createOrder(data: CreateOrderDto): Promise<any>;
    // verifyPayment(data: VerifyPaymentDto): Promise<any>;
    // placeOrder(data: PlaceOrderDto): Promise<any>;
    getAllRestaurantOrders(data: GetAllRestaurantOrdersDto): Promise<RestaurantOrderResponseDto>;
    changeTheOrderStatus(data: ChangeOrderStatusDto): Promise<ChangeOrderStatusResponseDto>;
    getUserOrders(data: GetUserOrdersDto): Promise<GetUserOrdersResponseDto>;
    getOrderDetails(data: GetOrderDetailsDto): Promise<GetOrderDetailsResponseDto>;
    cancelOrder(data: CancelOrderDto): Promise<CancelOrderResponseDto>;
    updateDeliveryBoy(data: UpdateDeliveryBoyDto): Promise<UpdateDeliveryBoyResponseDto>;
    removeDeliveryBoy(data: RemoveDeliveryBoyDto): Promise<RemoveDeliveryBoyResponseDto>;
    verifyOrderNumber(data: VerifyOrderNumberDto): Promise<VerifyOrderNumberResponseDto>;
    completeDelivery(data: CompleteDeliveryDto): Promise<CompleteDeliveryResponseDto>
    getDeliveryPartnerOrders(data: GetDeliveryPartnerOrdersDto): Promise<GetDeliveryPartnerOrdersResponseDto>
    createCashOnDeliveryOrder(data: CreateOrderDTO): Promise<CreateOrderResponseDTO>
    createUPIOrder(data: CreateOrderDTO): Promise<CreateOrderResponseDTO>
}