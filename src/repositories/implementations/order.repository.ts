
import OrderModel from '../../models/order.model';
import { IOrderRepository } from '../interfaces/order.repository.interface';
import { IOrder } from '../../models/interfaces/order.interface';

export class OrderRepository implements IOrderRepository {
    async createOrder(order: Partial<IOrder>): Promise<IOrder> {
        try {          
            const newOrder = new OrderModel(order);
            return await newOrder.save();
        } catch (error) {
            throw new Error(`Failed to create order: ${(error as Error).message}`);
        }
    }

    async getOrdersByRestaurantId(restaurantId: string): Promise<IOrder[]> {
        try {
            return await OrderModel.find({ 'items.restaurantId': restaurantId }).sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Failed to fetch orders: ${(error as Error).message}`);
        }
    }

    async changeTheOrderStatus(data: { orderId: string; orderStatus: string; }): Promise<any> {
        try {
            const orderId = data.orderId
            const orderStatus = data.orderStatus
            const result = await OrderModel.findByIdAndUpdate(
                orderId,
                { $set: { orderStatus } },
                { new: true }
            );
            return result;
        } catch (error) {
            throw new Error(`Failed to chnage the order status: ${(error as Error).message}`);
        }
    }

    async getUserOrder(data: { userId: string; }): Promise<{ success: boolean; data?: IOrder[]; error?: string; }> {
        try {
            const user_id = data.userId
            const result = await OrderModel.find({ userId: user_id }).sort({ createdAt: -1 })
            if (!result) {
                return { success: false, error: 'Order Is Not Found' }
            }
            return { success: true, data: result }
        } catch (error) {
            throw new Error(`Failed to fetch the user order: ${(error as Error).message}`);
        }
    }

    async getOrderDetails(data: { orderId: string; }): Promise<any> {
        try {
            const order_id = data.orderId
            const result = await OrderModel.findById(order_id)
            if (!result) {
                return { success: false, error: 'Order Is Not Found' }
            }
            return { success: true, data: result }
        } catch (error) {
            throw new Error(`Failed to fetch the user order: ${(error as Error).message}`);
        }
    }

    async findOrderById(orderId: string): Promise<any> {
        return await OrderModel.findOne({ _id: orderId }).lean();
    }

    async updateOrderStatus(orderId: string, status: string): Promise<any> {
        return await OrderModel.findOneAndUpdate(
            { _id: orderId },
            { orderStatus: status },
            { new: true }
        ).lean();
    }

    async updateOrderWithDeliveryBoy(orderId: string, deliveryBoy: { id: string; name: string; mobile: string; profileImage: string; totalDeliveries:number }): Promise<any> {
        try {
            const updatedOrder = await OrderModel.findOneAndUpdate(
                { _id: orderId, deliveryBoy: { $exists: false } },
                { $set: { deliveryBoy } },
                { new: true }
            ).lean();
            return updatedOrder;
        } catch (error) {
            throw new Error(`Failed to assign delivery boy: ${(error as Error).message}`);
        }
    }

    async removeDeliveryBoy(orderId: string): Promise<any> {
        try {
            const updatedOrder = await OrderModel.findOneAndUpdate(
                { _id: orderId },
                { $unset: { deliveryBoy: '' } },
                { new: true }
            ).lean();
            return updatedOrder;
        } catch (error) {
            throw new Error(`Failed to remove delivery boy: ${(error as Error).message}`);
        }
    }

    async getOrdersByDeliveryBoyId(deliveryBoyId: string): Promise<{ success: boolean; data?: IOrder[]; error?: string; }> {
        try {
            const orders = await OrderModel.find({ 'deliveryBoy.id': deliveryBoyId, orderStatus: 'Delivered' }).sort({ createdAt: -1 })
            if (!orders) {
                return { success: false, error: 'Orders Not Found' }
            }
            return { success: true, data: orders }
        } catch (error) {
            return { success: false, error: `Failed to fetch the delivery partner order:${(error as Error).message}` }
        }
    }
}