
import { Types } from 'mongoose';
import { format } from 'date-fns';
import { IOrderService } from '../interfaces/order.service.interface';
import { IOrderRepository } from '../../repositories/interfaces/order.repository.interface';
import { CreateOrderDTO, CreateOrderResponseDTO } from '../../dto/create.order.dto';
import { generateOrderPin } from '../../util/order-number.util';
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
import { DashboardStatsDto, DashboardStatsResponseDto, IOrder } from '../../dto/dashboard-stats.dto';
import { IOrder as ModelOrder } from "../../models/interfaces/order.interface";
import { IOrder as DtoOrder } from "../../dto/dashboard-stats.dto";


export class OrderService implements IOrderService {
    private orderRepository: IOrderRepository;

    constructor(orderRepository: IOrderRepository) {
        this.orderRepository = orderRepository;
    }

    private mapOrderToDto(order: ModelOrder): DtoOrder {
        return {
            _id: order._id.toString(),
            orderId: order.orderId,
            userId: order.userId.toString(),
            userName: order.userName,
            items: order.items.map(item => ({
                foodId: item.foodId.toString(),
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                category: item.category,
                description: item.description,
                images: item.images,
                hasVariants: item.hasVariants,
                variants: item.variants || [],
                restaurantId: item.restaurantId?.toString() || "",
                restaurantName: item.restaurantName
            })),
            address: order.address.map(addr => ({
                street: addr.street,
                city: addr.city,
                state: addr.state,
                pinCode: addr.pinCode
            })),
            phoneNumber: order.phoneNumber,
            payment: {
                method: order.payment.method,
                status: order.payment.status
            },
            orderStatus: order.orderStatus,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt ? order.createdAt.toISOString() : ""
        };
    }


    private aggregateRevenueData(orders: ModelOrder[], period: string): { name: string; value: number }[] {
        const dataMap = new Map<string, number>();

        orders.forEach((order) => {
            const date = new Date(order.createdAt);
            let key: string;

            switch (period) {
                case 'weekly':
                    key = format(date, 'EEE');
                    break;
                case 'monthly':
                    key = format(date, 'MMM dd');
                    break;
                case 'yearly':
                    key = format(date, 'MMM');
                    break;
                case 'custom':
                    key = format(date, 'MMM dd yyyy');
                    break;
                default:
                    key = format(date, 'EEE');
            }

            dataMap.set(key, (dataMap.get(key) || 0) + order.totalAmount);
        });

        let result: { name: string; value: number }[];
        if (period === 'weekly') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            result = days.map((day) => ({ name: day, value: dataMap.get(day) || 0 }));
        } else if (period === 'monthly') {
            const now = new Date();
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            result = Array.from({ length: daysInMonth }, (_, i) => {
                const day = (i + 1).toString().padStart(2, '0');
                const key = `${format(now, 'MMM')} ${day}`;
                return { name: key, value: dataMap.get(key) || 0 };
            });
        } else if (period === 'yearly') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            result = months.map((month) => ({ name: month, value: dataMap.get(month) || 0 }));
        } else {
            result = Array.from(dataMap, ([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
            result.sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
        }

        return result;
    }

    private aggregateTopItems(orders: ModelOrder[]): { name: string; value: number }[] {
        const itemMap = new Map<string, { name: string; value: number }>();

        orders.forEach((order) => {
            order.items.forEach((item) => {
                const current = itemMap.get(item.foodId.toString()) || { name: item.name, value: 0 };
                itemMap.set(item.foodId.toString(), {
                    name: item.name,
                    value: current.value + item.quantity,
                });
            });
        });

        return Array.from(itemMap.values())
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }

    async getAllRestaurantOrder(data: GetAllRestaurantOrdersDto): Promise<RestaurantOrderResponseDto> {
        try {
            const restaurantId = data.restaurantId
            const orders = await this.orderRepository.getOrdersByRestaurantId(restaurantId);
            return { success: true, data: orders };
        } catch (error) {
            return { success: false, error: `Order fetching failed: ${(error as Error).message}` };
        }
    }

    async getDashboardStats(data: DashboardStatsDto): Promise<DashboardStatsResponseDto> {
        try {
            const { restaurantId, period, startDate, endDate } = data;
            let query: any = { 'items.restaurantId': restaurantId };

            if (period === 'custom' && startDate && endDate) {
                query.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                };
            } else {
                const now = new Date();
                let start: Date;
                switch (period) {
                    case 'weekly':
                        start = new Date(now.setDate(now.getDate() - now.getDay()));
                        break;
                    case 'monthly':
                        start = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case 'yearly':
                        start = new Date(now.getFullYear(), 0, 1);
                        break;
                    default:
                        start = new Date(now.setDate(now.getDate() - now.getDay()));
                }
                query.createdAt = { $gte: start, $lte: new Date() };
            }

            const orders = await this.orderRepository.getOrdersByRestaurantIdWithFilter(query);

            const revenueData = this.aggregateRevenueData(orders, period);

            const topItems = this.aggregateTopItems(orders);

            const totalOrders = orders.length;
            const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
            const totalProfit = totalSales * 0.3;

            const dtoOrders = orders.map(o => this.mapOrderToDto(o));

            return {
                success: true,
                data: {
                    revenueData,
                    topItems,
                    totalOrders,
                    totalSales,
                    totalProfit,
                    recentOrders: dtoOrders.slice(0, 5),
                },
            };
        } catch (error) {
            return { success: false, error: `Failed to fetch dashboard stats: ${(error as Error).message}` };
        }
    }

    async changeTheOrderStatus(data: ChangeOrderStatusDto): Promise<ChangeOrderStatusResponseDto> {
        try {
            const orderStatusResponse = await this.orderRepository.changeTheOrderStatus(data)
            return orderStatusResponse
        } catch (error) {
            return { success: false, error: `Order Stauts Change failed: ${(error as Error).message}` };
        }
    }

    async getUserOrder(data: GetUserOrdersDto): Promise<GetUserOrdersResponseDto> {
        try {
            return await this.orderRepository.getUserOrder(data)
        } catch (error) {
            return { success: false, error: `Get User Order failed: ${(error as Error).message}` };
        }
    }

    async getOrderDetails(data: GetOrderDetailsDto): Promise<GetOrderDetailsResponseDto> {
        try {
            return await this.orderRepository.getOrderDetails(data)
        } catch (error) {
            return { success: false, error: `Get User Order failed: ${(error as Error).message}` };
        }
    }

    async cancelOrder(data: CancelOrderDto): Promise<CancelOrderResponseDto> {
        const order = await this.orderRepository.findOrderById(data.orderId);
        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        const canCancel = !['Picked', 'Delivered', 'Cancelled'].includes(order.orderStatus);

        if (!canCancel) {
            return { success: false, message: 'Order cannot be cancelled' };
        }

        const updatedOrder = await this.orderRepository.updateOrderStatus(data.orderId, 'Cancelled');

        if (!updatedOrder) {
            return { success: false, message: 'Failed to cancel order' };
        }

        if (order.payment.method === 'UPI') {
            return {
                success: true,
                message: 'Order cancelled successfully',
                refundRequired: true,
                refundData: {
                    userId: order.userId.toString(),
                    amount: order.totalAmount,
                    restaurantId: order.items[0]?.restaurantId?.toString(),
                    items: order.items.map((item: any) => ({
                        foodId: item.foodId.toString(),
                        quantity: item.quantity,
                    })),
                },
            };
        }

        return {
            success: true,
            message: 'Order cancelled successfully',
            refundRequired: false,
            refundData: {
                userId: order.userId.toString(),
                amount: order.totalAmount,
                restaurantId: order.items[0]?.restaurantId?.toString(),
                items: order.items.map((item: any) => ({
                    foodId: item.foodId.toString(),
                    quantity: item.quantity,
                })),
            },
        };
    }

    async updateDeliveryBoy(data: UpdateDeliveryBoyDto): Promise<UpdateDeliveryBoyResponseDto> {
        try {
            const { orderId, deliveryBoyId, deliveryBoyName, mobile, profileImage, totalDeliveries } = data;
            const order = await this.orderRepository.findOrderById(orderId);

            if (!order) {
                return { success: false, message: 'Order not found' };
            }
            if (order.deliveryBoy?.id) {
                return { success: false, message: 'Order already assigned to another delivery boy' };
            }
            if (!['Preparing', 'Pending'].includes(order.orderStatus)) {
                return { success: false, message: 'Order cannot be assigned in current status' };
            }

            const updatedOrder = await this.orderRepository.updateOrderWithDeliveryBoy(orderId, {
                id: deliveryBoyId.toString(),
                name: deliveryBoyName,
                mobile,
                profileImage: profileImage || '',
                totalDeliveries: totalDeliveries
            });

            if (!updatedOrder) {
                return { success: false, message: 'Failed to assign delivery boy' };
            }

            await this.orderRepository.updateOrderStatus(orderId, 'Accepted');

            return { success: true, message: 'Delivery boy assigned successfully' };
        } catch (error) {
            console.error('Error in updateDeliveryBoy:', error);
            return { success: false, message: `Failed to assign delivery boy: ${(error as Error).message}` };
        }
    }

    async removeDeliveryBoy(data: RemoveDeliveryBoyDto): Promise<RemoveDeliveryBoyResponseDto> {
        try {
            const { orderId } = data;
            const order = await this.orderRepository.findOrderById(orderId);
            if (!order) {
                return { success: false, message: 'Order not found' };
            }
            const updatedOrder = await this.orderRepository.removeDeliveryBoy(orderId);
            if (!updatedOrder) {
                return { success: false, message: 'Failed to remove delivery boy' };
            }
            await this.orderRepository.updateOrderStatus(orderId, 'Pending');
            return { success: true, message: 'Delivery boy removed successfully' };
        } catch (error) {
            console.error('Error in removeDeliveryBoy:', error);
            return { success: false, message: `Failed to remove delivery boy: ${(error as Error).message}` };
        }
    }

    async verifyOrderNumber(data: VerifyOrderNumberDto): Promise<VerifyOrderNumberResponseDto> {
        try {
            const { enteredPin, orderId } = data
            const order = await this.orderRepository.findOrderById(orderId)
            if (!order) {
                return { success: false, message: 'Order not found' };
            }
            const userLocation = order.location
            const convertToNumber = Number(enteredPin)
            if (order.orderNumber === convertToNumber) {
                await this.orderRepository.updateOrderStatus(orderId, 'Picked')
                return { success: true, message: 'PIN verified successfully', location: userLocation, userId: order.userId };
            } else {
                return { success: false, message: 'Entered PIN does not match the order' };
            }

        } catch (error) {
            console.error('Error in verifyOrderNumber:', error);
            return { success: false, message: `Failed to verify order number: ${(error as Error).message}` };
        }
    }

    async completeDelivery(data: CompleteDeliveryDto): Promise<CompleteDeliveryResponseDto> {
        try {
            const { orderId } = data;
            const order = await this.orderRepository.findOrderById(orderId);

            if (!order) {
                return { success: false, message: 'Order not found' };
            }

            if (order.orderStatus === 'Delivered') {
                return { success: false, message: 'Order is already delivered' };
            }

            if (order.orderStatus !== 'Picked') {
                return { success: false, message: `Order cannot be completed from status: ${order.orderStatus}` };
            }

            const updatedOrder = await this.orderRepository.updateOrderStatus(orderId, 'Delivered');

            if (!updatedOrder) {
                return { success: false, message: 'Failed to update order status' };
            }

            return { success: true, data: updatedOrder, message: 'Order status updated to Delivered' };
        } catch (error) {
            console.error('Error in completeDelivery:', error);
            return { success: false, message: `Failed to complete delivery: ${(error as Error).message}` };
        }
    }

    async getDeliveryPartnerOrders(data: GetDeliveryPartnerOrdersDto): Promise<GetDeliveryPartnerOrdersResponseDto> {
        try {
            const { deliveryBoyId } = data
            const orders = await this.orderRepository.getOrdersByDeliveryBoyId(deliveryBoyId)
            return orders
        } catch (error) {
            console.error('Error in get delivery partner orders:', error);
            return { success: false, error: `Error on get delivery partner orders : ${(error as Error).message}` };
        }
    }

    async createCashOnDeliveryOrder(data: CreateOrderDTO): Promise<CreateOrderResponseDTO> {
        try {
            const orderItems = data.cartItems.map(item => ({
                foodId: new Types.ObjectId(item.id),
                quantity: item.quantity,
                price: item.price,
                restaurantName: item.restaurant,
                restaurantId: item.restaurantId,
                name: item.name,
                description: item.description,
                category: item.category,
                images: item.images,
                hasVariants: item.hasVariants,
                variants: item.variants,
            }));
            const addressParts = data.address.split(',').map(part => part.trim());
            if (addressParts.length !== 5) {
                throw new Error('Invalid address format');
            }
            const [houseName, street, city, state, pinCode] = addressParts;
            const address = [{
                houseName,
                street,
                city,
                state,
                pinCode,
            }];
            const order = await this.orderRepository.createOrder({
                userId: new Types.ObjectId(data.userId),
                userName: data.userName,
                items: orderItems,
                address,
                location: data.location,
                phoneNumber: data.phoneNumber,
                payment: {
                    method: 'Cash',
                    status: 'Pending',
                },
                orderStatus: 'Pending',
                orderNumber: generateOrderPin(),
                totalAmount: data.total,
            });
            return { success: true, orderId: order._id };
        } catch (error) {
            console.error('Error creating COD order:', error);
            return { success: false, error: `Order placement failed: ${(error as Error).message}` };
        }
    }

    async createUPIOrder(data: CreateOrderDTO): Promise<CreateOrderResponseDTO> {
        try {
            const orderItems = data.cartItems.map(item => ({
                foodId: new Types.ObjectId(item.id),
                quantity: item.quantity,
                price: item.price,
                restaurantName: item.restaurant,
                restaurantId: item.restaurantId,
                name: item.name,
                description: item.description,
                category: item.category,
                images: item.images,
                hasVariants: item.hasVariants,
                variants: item.variants,
            }));

            const addressParts = data.address.split(',').map(part => part.trim());
            if (addressParts.length !== 5) {
                throw new Error('Invalid address format');
            }

            const [houseName, street, city, state, pinCode] = addressParts;

            const address = [{
                houseName,
                street,
                city,
                state,
                pinCode,
            }];

            const order = await this.orderRepository.createOrder({
                userId: new Types.ObjectId(data.userId),
                userName: data.userName,
                items: orderItems,
                address,
                location: data.location,
                phoneNumber: data.phoneNumber,
                payment: {
                    method: 'UPI',
                    status: 'Pending',
                    // paymentId: data.paymentId
                },
                orderStatus: 'Pending',
                orderNumber: generateOrderPin(),
                totalAmount: data.total,
            });
            return { success: true, orderId: order._id }
        } catch (error) {
            console.error('verification side error :', error);
            return { success: false, error: `Payment verification failed: ${(error as Error).message}` };
        }
    }

}