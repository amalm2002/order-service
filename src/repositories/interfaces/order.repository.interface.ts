
import { IOrder } from "../../models/interfaces/order.interface";

export interface IOrderRepository {
    createOrder(order: Partial<IOrder>): Promise<IOrder>;
    getOrdersByRestaurantId(data: {
        restaurantId: string;
        page: number;
        limit: number;
    }): Promise<{
        success: boolean;
        data?: { orders: IOrder[]; totalOrders: number; currentPage: number; totalPages: number };
        error?: string;
    }>;
    getOrdersByRestaurantIdWithFilter(query: any): Promise<IOrder[]>;
    changeTheOrderStatus(data: { orderId: string, orderStatus: string }): Promise<any>
    getUserOrder(data: { userId: string; page: number; limit: number }): Promise<{
        success: boolean;
        data?: { orders: IOrder[]; totalOrders: number; currentPage: number; totalPages: number };
        error?: string;
    }>
    getOrderDetails(data: { orderId: string }): Promise<any>
    findOrderById(orderId: string): Promise<any>;
    updateOrderStatus(orderId: string, status: string): Promise<any>;
    updateOrderWithDeliveryBoy(orderId: string, deliveryBoy: { id: string; name: string; mobile: string; profileImage: string, totalDeliveries: number }): Promise<any>;
    removeDeliveryBoy(orderId: string): Promise<any>;
    getOrdersByDeliveryBoyId(deliveryBoyId: string): Promise<{ success: boolean; data?: IOrder[], error?: string }>
}