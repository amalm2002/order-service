
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

    async getOrdersByRestaurantId(data: {
        restaurantId: string;
        page: number;
        limit: number;
    }): Promise<{
        success: boolean;
        data?: { orders: IOrder[]; totalOrders: number; currentPage: number; totalPages: number };
        error?: string;
    }> {
        try {
            const { restaurantId, page = 1, limit = 4 } = data;
            const skip = (page - 1) * limit;

            const orders = await OrderModel.find({ 'items.restaurantId': restaurantId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const totalOrders = await OrderModel.countDocuments({ 'items.restaurantId': restaurantId });

            if (!orders || orders.length === 0) {
                return { success: false, error: 'No orders found' };
            }

            return {
                success: true,
                data: {
                    orders,
                    totalOrders,
                    currentPage: page,
                    totalPages: Math.ceil(totalOrders / limit),
                },
            };
        } catch (error) {
            throw new Error(`Failed to fetch orders: ${(error as Error).message}`);
        }
    }

    async getOrdersByRestaurantIdWithFilter(query: any): Promise<IOrder[]> {
        try {
            return await OrderModel.find(query).sort({ createdAt: -1 });
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

    async getUserOrder(data: { userId: string; page: number; limit: number }): Promise<{
        success: boolean;
        data?: { orders: IOrder[]; totalOrders: number; currentPage: number; totalPages: number };
        error?: string;
    }> {
        try {
            const { userId, page = 1, limit = 10 } = data;
            const skip = (page - 1) * limit;

            const orders = await OrderModel.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const totalOrders = await OrderModel.countDocuments({ userId });

            if (!orders || orders.length === 0) {
                return { success: false, error: 'No orders found' };
            }

            return {
                success: true,
                data: {
                    orders,
                    totalOrders,
                    currentPage: page,
                    totalPages: Math.ceil(totalOrders / limit),
                },
            };
        } catch (error) {
            throw new Error(`Failed to fetch user orders: ${(error as Error).message}`);
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

    async updateOrderWithDeliveryBoy(orderId: string, deliveryBoy: { id: string; name: string; mobile: string; profileImage: string; totalDeliveries: number }): Promise<any> {
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