
import { IOrderService } from '../interfaces/order.service.interface';
import { IOrderRepository } from '../../repositories/interfaces/order.repository.interface';
import { CreateOrderDTO, CreateOrderResponseDTO } from '../../dto/create.order.dto';
import { Types } from 'mongoose';
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


export class OrderService implements IOrderService {
    private orderRepository: IOrderRepository;

    constructor(orderRepository: IOrderRepository) {
        this.orderRepository = orderRepository;
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
            console.log('UPI data :', data);
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