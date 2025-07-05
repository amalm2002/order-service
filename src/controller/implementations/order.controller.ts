import { IOrderController } from '../interfaces/order.controller.interface';
import { IOrderService } from '../../services/interfaces/order.service.interface';
import { CreateOrderDto } from '../../dto/create.order.dto';
import { VerifyPaymentDto } from '../../dto/verify-payment.dto';
import { PlaceOrderDto } from '../../dto/place-order.dto';
import { IOrder } from '../../models/interfaces/order.interface';


export class OrderController implements IOrderController {
    private service: IOrderService;

    constructor(service: IOrderService) {
        this.service = service;
    }

    async createOrder(data: CreateOrderDto): Promise<any> {
        return await this.service.createOrder(data);
    }

    async verifyPayment(data: VerifyPaymentDto): Promise<any> {
        return await this.service.verifyPayment(data);
    }

    async placeOrder(data: PlaceOrderDto): Promise<any> {
        return await this.service.placeOrder(data);
    }

    async getAllRestaurantOrders(data: { restaurantId: string }): Promise<{ success: boolean; data?: IOrder[]; error?: string }> {
        const restaurant_id = data.restaurantId
        return await this.service.getAllRestaurantOrder(restaurant_id);
    }

    async changeTheOrderStatus(data: { orderId: string; orderStatus: string; }): Promise<any> {
        return await this.service.changeTheOrderStatus(data)
    }

    async getUserOrders(data: { userId: string; }): Promise<{ success: boolean; data?: IOrder[]; error?: string }> {
        return await this.service.getUserOrder(data)
    }

    async getOrderDetails(data: { orderId: string; }): Promise<any> {
        return await this.service.getOrderDetails(data)
    }

    async cancelOrder(data: { orderId: string; }): Promise<any> {
        // console.log('controller :', data);
        return await this.service.cancelOrder(data)
    }

    async updateDeliveryBoy(data: {
        orderId: string; deliveryBoyId: string; deliveryBoyName: string;
        mobile: string; profileImage?: string
    }): Promise<{ success: boolean; message: string }> {
        // console.log('controller side data :',data);
        return await this.service.updateDeliveryBoy(data);
    }

    async removeDeliveryBoy(data: { orderId: string }): Promise<{ success: boolean; message: string }> {
        // console.log('Removing delivery boy for order:', data);
        return await this.service.removeDeliveryBoy(data);
    }

    async verifyOrderNumber(data: { enteredPin: number; orderId: string; }): Promise<{ success: boolean; message: string; location?: { latitude: number, longitude: number }; userId?: string }> {
        return await this.service.verifyOrderNumber(data)
    }

    async completeDelivery(data: { orderId: string; }): Promise<any> {
        return await this.service.completeDelivery(data)
    }

    async getDeliveryPartnerOrders(data: { deliveryBoyId: string; }): Promise<{ success: boolean; data?: IOrder[]; error?: string; }> {
        return await this.service.getDeliveryPartnerOrders(data)
    }
}