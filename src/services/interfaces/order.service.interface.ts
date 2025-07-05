import { CreateOrderDto } from '../../dto/create.order.dto';
import { VerifyPaymentDto } from '../../dto/verify-payment.dto';
import { PlaceOrderDto } from '../../dto/place-order.dto';
import { IOrder } from '../../models/interfaces/order.interface';

export interface IOrderService {
    createOrder(data: CreateOrderDto): Promise<any>;
    verifyPayment(data: VerifyPaymentDto): Promise<any>;
    placeOrder(data: PlaceOrderDto): Promise<any>;
    getAllRestaurantOrder(restaurantId: string): Promise<{ success: boolean; data?: IOrder[]; error?: string }>;
    changeTheOrderStatus(data: { orderId: string, orderStatus: string }): Promise<any>
    getUserOrder(data: { userId: string }): Promise<{ success: boolean; data?: IOrder[]; error?: string }>
    getOrderDetails(data: { orderId: string }): Promise<any>
    cancelOrder(data: { orderId: string }): Promise<any>
    updateDeliveryBoy(data: { orderId: string; deliveryBoyId: string; deliveryBoyName: string; mobile: string; profileImage?: string }):
        Promise<{ success: boolean; message: string }>;
    removeDeliveryBoy(data: { orderId: string }): Promise<{ success: boolean; message: string }>;
    verifyOrderNumber(data: { enteredPin: number; orderId: string }): Promise<{ success: boolean; message: string; location?: { latitude: number, longitude: number }; userId?: string }>;
    completeDelivery(data: { orderId: string }): Promise<any>
    getDeliveryPartnerOrders(data: { deliveryBoyId: string }): Promise<{ success: boolean; data?: IOrder[]; error?: string }>
}