
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
import { DeliveryBoyService } from '../../delivery-service-connection/config/delivery.client';



export class OrderService implements IOrderService {

    constructor(
        private readonly _orderRepository: IOrderRepository
    ) { }

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

    private _aggregateTopItems(orders: ModelOrder[]): { name: string; value: number }[] {
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

    async getAllRestaurantOrder(restaurantOrdersQuery: GetAllRestaurantOrdersDto): Promise<RestaurantOrderResponseDto> {
        try {
            const { restaurantId, page = 1, limit = 4 } = restaurantOrdersQuery;
            return await this._orderRepository.getOrdersByRestaurantId({ restaurantId, page, limit });
        } catch (error) {
            return { success: false, error: `Order fetching failed: ${(error as Error).message}` };
        }
    }

    async getDashboardStats(dashboardStatsQuery: DashboardStatsDto): Promise<DashboardStatsResponseDto> {
        try {
            const { restaurantId, period, startDate, endDate } = dashboardStatsQuery;
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

            const orders = await this._orderRepository.getOrdersByRestaurantIdWithFilter(query);

            const revenueData = this.aggregateRevenueData(orders, period);

            const topItems = this._aggregateTopItems(orders);

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

    async changeTheOrderStatus(orderStatusUpdate: ChangeOrderStatusDto): Promise<ChangeOrderStatusResponseDto> {
        try {
            const orderStatusResponse = await this._orderRepository.changeTheOrderStatus(orderStatusUpdate)
            return orderStatusResponse
        } catch (error) {
            return { success: false, error: `Order Stauts Change failed: ${(error as Error).message}` };
        }
    }

    async getUserOrder(userOrdersQuery: GetUserOrdersDto): Promise<GetUserOrdersResponseDto> {
        try {
            const { userId, page = 1, limit = 10 } = userOrdersQuery;
            return await this._orderRepository.getUserOrder({ userId, page, limit });
        } catch (error) {
            return { success: false, error: `Get User Order failed: ${(error as Error).message}` };
        }
    }

    async getOrderDetails(orderDetailsQuery: GetOrderDetailsDto): Promise<GetOrderDetailsResponseDto> {
        try {
            return await this._orderRepository.getOrderDetails(orderDetailsQuery)
        } catch (error) {
            return { success: false, error: `Get User Order failed: ${(error as Error).message}` };
        }
    }

    async getOrderDetail(orderDetailsQuery: GetOrderDetailsDto): Promise<GetOrderDetailsResponseDto> {
        try {
            const { deliveryBoyId } = orderDetailsQuery

            const order = await this._orderRepository.getOrderDetails(orderDetailsQuery)

            if (!order.success || !order.data) {
                return { success: false, message: 'Order not found' };
            }

            if (order.data.deliveryBoy?.id) {
                return { success: false, message: 'Order already assigned to another delivery boy' };
            }

            const deliveryBoyResponse = await new Promise<{ message: string, response: any }>((resolve, reject) => {
                DeliveryBoyService.FetchDeliveryBoy({ deliveryBoyId }, (err: any, result: any) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                });
            });

            if (!deliveryBoyResponse.response) {
                return { success: false, message: 'Delivery boy not found' };
            }

            const { name, mobile, profileImage, ordersCompleted } = deliveryBoyResponse.response;

            const assignPayload = {
                orderId: orderDetailsQuery.orderId,
                deliveryBoyId,
                deliveryBoyName: name,
                mobile,
                profileImage,
                totalDeliveries: ordersCompleted
            };

            const orderAssignResponse = await this.updateDeliveryBoy(assignPayload);

            if (!orderAssignResponse.success) {
                return { success: false, message: orderAssignResponse.message };
            }

            const deliveryBoyUpdate = await new Promise<{ message: string, status: string, response: any }>((resolve, reject) => {
                DeliveryBoyService.DeliveryBoyUpdate({ orderId: orderDetailsQuery.orderId, deliveryBoyId }, (err: any, result: any) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                })
            })

            console.log('delivery update response :', deliveryBoyUpdate)

            if (deliveryBoyUpdate.status !== 'success') {
                const rollbackPayload = { orderId: orderDetailsQuery.orderId, deliveryBoy: null };
                await this.removeDeliveryBoy(rollbackPayload);

                return { success: false, message: deliveryBoyUpdate.message || 'Failed to update delivery boy' };
            }

            return {
                success: true,
                message: 'Delivery boy assigned successfully',
            };
        } catch (error) {
            return { success: false, error: `Get User Order failed: ${(error as Error).message}` };
        }
    }

    async cancelOrder(cancelOrderRequest: CancelOrderDto): Promise<CancelOrderResponseDto> {
        const order = await this._orderRepository.findOrderById(cancelOrderRequest.orderId);
        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        const canCancel = !['Picked', 'Delivered', 'Cancelled'].includes(order.orderStatus);

        if (!canCancel) {
            return { success: false, message: 'Order cannot be cancelled' };
        }

        const updatedOrder = await this._orderRepository.updateOrderStatus(cancelOrderRequest.orderId, 'Cancelled');

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

    async updateDeliveryBoy(updateDeliveryBoy: UpdateDeliveryBoyDto): Promise<UpdateDeliveryBoyResponseDto> {
        try {
            const { orderId, deliveryBoyId, deliveryBoyName, mobile, profileImage, totalDeliveries } = updateDeliveryBoy;
            const order = await this._orderRepository.findOrderById(orderId);

            if (!order) {
                return { success: false, message: 'Order not found' };
            }
            if (order.deliveryBoy?.id) {
                return { success: false, message: 'Order already assigned to another delivery boy' };
            }

            const updatedOrder = await this._orderRepository.updateOrderWithDeliveryBoy(orderId, {
                id: deliveryBoyId.toString(),
                name: deliveryBoyName,
                mobile,
                profileImage: profileImage || '',
                totalDeliveries: totalDeliveries
            });

            if (!updatedOrder) {
                return { success: false, message: 'Failed to assign delivery boy' };
            }

            await this._orderRepository.updateOrderStatus(orderId, 'Accepted');

            return { success: true, message: 'Delivery boy assigned successfully' };

        } catch (error) {
            console.error('Error in updateDeliveryBoy:', error);
            return { success: false, message: `Failed to assign delivery boy: ${(error as Error).message}` };
        }
    }

    async removeDeliveryBoy(removeDeliveryBoy: RemoveDeliveryBoyDto): Promise<RemoveDeliveryBoyResponseDto> {
        try {
            const { orderId } = removeDeliveryBoy;
            const order = await this._orderRepository.findOrderById(orderId);
            if (!order) {
                return { success: false, message: 'Order not found' };
            }
            const updatedOrder = await this._orderRepository.removeDeliveryBoy(orderId);
            if (!updatedOrder) {
                return { success: false, message: 'Failed to remove delivery boy' };
            }
            await this._orderRepository.updateOrderStatus(orderId, 'Pending');
            return { success: true, message: 'Delivery boy removed successfully' };
        } catch (error) {
            console.error('Error in removeDeliveryBoy:', error);
            return { success: false, message: `Failed to remove delivery boy: ${(error as Error).message}` };
        }
    }

    async verifyOrderNumber(verifyOrderRequest: VerifyOrderNumberDto): Promise<VerifyOrderNumberResponseDto> {
        try {
            const { enteredPin, orderId } = verifyOrderRequest
            const order = await this._orderRepository.findOrderById(orderId)
            if (!order) {
                return { success: false, message: 'Order not found' };
            }
            const userLocation = order.location
            const convertToNumber = Number(enteredPin)
            if (order.orderNumber === convertToNumber) {
                await this._orderRepository.updateOrderStatus(orderId, 'Picked')
                return { success: true, message: 'PIN verified successfully', location: userLocation, userId: order.userId };
            } else {
                return { success: false, message: 'Entered PIN does not match the order' };
            }

        } catch (error) {
            console.error('Error in verifyOrderNumber:', error);
            return { success: false, message: `Failed to verify order number: ${(error as Error).message}` };
        }
    }

    async completeDelivery(deliveryCompletionRequest: CompleteDeliveryDto): Promise<CompleteDeliveryResponseDto> {
        try {
            const { orderId } = deliveryCompletionRequest;
            const order = await this._orderRepository.findOrderById(orderId);

            if (!order) {
                return { success: false, message: 'Order not found' };
            }

            if (order.orderStatus === 'Delivered') {
                return { success: false, message: 'Order is already delivered' };
            }

            if (order.orderStatus !== 'Picked') {
                return { success: false, message: `Order cannot be completed from status: ${order.orderStatus}` };
            }

            const updatedOrder = await this._orderRepository.updateOrderStatus(orderId, 'Delivered');

            if (!updatedOrder) {
                return { success: false, message: 'Failed to update order status' };
            }

            return { success: true, data: updatedOrder, message: 'Order status updated to Delivered' };
        } catch (error) {
            console.error('Error in completeDelivery:', error);
            return { success: false, message: `Failed to complete delivery: ${(error as Error).message}` };
        }
    }

    async getDeliveryPartnerOrders(deliveryPartnerOrdersQuery: GetDeliveryPartnerOrdersDto): Promise<GetDeliveryPartnerOrdersResponseDto> {
        try {
            const { deliveryBoyId } = deliveryPartnerOrdersQuery
            const orders = await this._orderRepository.getOrdersByDeliveryBoyId(deliveryBoyId)
            return orders
        } catch (error) {
            console.error('Error in get delivery partner orders:', error);
            return { success: false, error: `Error on get delivery partner orders : ${(error as Error).message}` };
        }
    }

    async createCashOnDeliveryOrder(cashOnDeliveryOrder: CreateOrderDTO): Promise<CreateOrderResponseDTO> {
        try {
            const orderItems = cashOnDeliveryOrder.cartItems.map(item => ({
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
            const addressParts = cashOnDeliveryOrder.address.split(',').map(part => part.trim());
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
            const order = await this._orderRepository.createOrder({
                userId: new Types.ObjectId(cashOnDeliveryOrder.userId),
                userName: cashOnDeliveryOrder.userName,
                items: orderItems,
                address,
                location: cashOnDeliveryOrder.location,
                phoneNumber: cashOnDeliveryOrder.phoneNumber,
                payment: {
                    method: 'Cash',
                    status: 'Pending',
                },
                orderStatus: 'Pending',
                orderNumber: generateOrderPin(),
                totalAmount: cashOnDeliveryOrder.total,
            });
            return { success: true, orderId: order._id, orderNumber: order.orderNumber };
        } catch (error) {
            console.error('Error creating COD order:', error);
            return { success: false, error: `Order placement failed: ${(error as Error).message}` };
        }
    }

    async createUPIOrder(upiOrder: CreateOrderDTO): Promise<CreateOrderResponseDTO> {
        try {
            const orderItems = upiOrder.cartItems.map(item => ({
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

            const addressParts = upiOrder.address.split(',').map(part => part.trim());
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

            const order = await this._orderRepository.createOrder({
                userId: new Types.ObjectId(upiOrder.userId),
                userName: upiOrder.userName,
                items: orderItems,
                address,
                location: upiOrder.location,
                phoneNumber: upiOrder.phoneNumber,
                payment: {
                    method: 'UPI',
                    status: 'Pending',
                    // paymentId: data.paymentId
                },
                orderStatus: 'Pending',
                orderNumber: generateOrderPin(),
                totalAmount: upiOrder.total,
            });
            return { success: true, orderId: order._id, orderNumber: order.orderNumber }
        } catch (error) {
            console.error('verification side error :', error);
            return { success: false, error: `Payment verification failed: ${(error as Error).message}` };
        }
    }

}