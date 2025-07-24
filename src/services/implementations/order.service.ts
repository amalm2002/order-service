
import { IOrderService } from '../interfaces/order.service.interface';
import { IOrderRepository } from '../../repositories/interfaces/order.repository.interface';
import { CreateOrderDTO, CreateOrderResponseDTO } from '../../dto/create.order.dto';
import { VerifyPaymentDto } from '../../dto/verify-payment.dto';
import { PlaceOrderDto } from '../../dto/place-order.dto';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createHash } from 'crypto';
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
    // private razorpay: Razorpay;
    private orderRepository: IOrderRepository;

    constructor(orderRepository: IOrderRepository) {
        this.orderRepository = orderRepository;
        // this.razorpay = new Razorpay({
        //     key_id: process.env.RAZORPAY_KEY_ID || '',
        //     key_secret: process.env.RAZORPAY_SECRET_ID || '',
        // });
    }

    // private generateCartHash(cartItems: any[]): string {
    //     const cartString = JSON.stringify(
    //         cartItems.map(item => ({
    //             id: item.id,
    //             quantity: item.quantity,
    //             price: item.price,
    //         })).sort((a, b) => a.id.localeCompare(b.id))
    //     );
    //     return createHash('sha256').update(cartString).digest('hex');
    // }

    // async createOrder(data: CreateOrderDto): Promise<any> {
    //     try {
    //         const { amount, userId, cartItems } = data;
    //         // console.log('create order data is :', data);

    //         const cartHash = this.generateCartHash(cartItems);
    //         const lockKey = `order:lock:${userId}:${cartHash}`;
    //         const lockTTL = 30;

    //         const lockAcquired = await redisClient.set(lockKey, 'locked', {
    //             EX: lockTTL,
    //             NX: true,
    //         });

    //         if (!lockAcquired) {
    //             return { error: 'An order is already being processed for this cart. Please wait a moment and try again.' };
    //         }

    //         try {
    //             const payload = {
    //                 amount: amount * 100,
    //                 currency: 'INR',
    //                 receipt: `receipt_${new Date().getTime()}`,
    //             };
    //             const rawOrder = await this.razorpay.orders.create(payload);
    //             return {
    //                 orderId: rawOrder.id,
    //                 razorpayKey: process.env.RAZORPAY_KEY_ID,
    //             };
    //         } catch (error) {
    //             await redisClient.del(lockKey);
    //             throw error;
    //         }
    //     } catch (error) {
    //         console.error('Error in createOrder:', error);
    //         return { error: `Failed to create order: ${(error as Error).message}` };
    //     }
    // }

    // async verifyPayment(data: VerifyPaymentDto): Promise<any> {
    //     try {
    //         const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = data;
    //         const razorData = razorpay_order_id + '|' + razorpay_payment_id;

    //         const expectedSignature = crypto
    //             .createHmac('sha256', process.env.RAZORPAY_SECRET_ID || process.env.VITE_RAZORPAY_SECRET_ID || '')
    //             .update(razorData.toString())
    //             .digest('hex');

    //         if (expectedSignature !== razorpay_signature) {
    //             return { success: false, error: 'Invalid signature' };
    //         }

    //         const orderItems = orderData.cartItems.map(item => ({
    //             foodId: new Types.ObjectId(item.id),
    //             quantity: item.quantity,
    //             price: item.price,
    //             restaurantName: item.restaurant,
    //             restaurantId: item.restaurantId,
    //             name: item.name,
    //             description: item.description,
    //             category: item.category,
    //             images: item.images,
    //             hasVariants: item.hasVariants,
    //             variants: item.variants,
    //         }));

    //         const addressParts = orderData.address.split(',').map(part => part.trim());
    //         if (addressParts.length !== 5) {
    //             throw new Error('Invalid address format');
    //         }

    //         const [houseName, street, city, state, pinCode] = addressParts;

    //         const address = [{
    //             houseName,
    //             street,
    //             city,
    //             state,
    //             pinCode,
    //         }];

    //         const order = await this.orderRepository.createOrder({
    //             userId: new Types.ObjectId(orderData.userId),
    //             items: orderItems,
    //             address,
    //             location: orderData.location,
    //             phoneNumber: orderData.phoneNumber,
    //             payment: {
    //                 method: 'UPI',
    //                 status: 'Success',
    //                 transactionId: orderData.paymentId,
    //                 paidAt: new Date(),
    //             },
    //             orderStatus: 'Pending',
    //             orderNumber: generateOrderPin(),
    //             totalAmount: orderData.total,
    //         });

    //         const cartHash = this.generateCartHash(orderData.cartItems);
    //         const lockKey = `order:lock:${orderData.userId}:${cartHash}`;
    //         await redisClient.del(lockKey);

    //         return { success: true, orderId: order._id };
    //     } catch (error) {
    //         const cartHash = this.generateCartHash(data.orderData.cartItems);
    //         const lockKey = `order:lock:${data.orderData.userId}:${cartHash}`;
    //         await redisClient.del(lockKey);
    //         return { success: false, error: `Payment verification failed: ${(error as Error).message}` };
    //     }
    // }

    // async placeOrder(data: PlaceOrderDto): Promise<any> {
    //     try {
    //         const { orderData } = data;
    //         // console.log('order data is :', orderData);

    //         const orderItems = orderData.cartItems.map(item => ({
    //             foodId: new Types.ObjectId(item.id),
    //             quantity: item.quantity,
    //             price: item.price,
    //             restaurantName: item.restaurant,
    //             restaurantId: item.restaurantId,
    //             name: item.name,
    //             description: item.description,
    //             category: item.category,
    //             images: item.images,
    //             hasVariants: item.hasVariants,
    //             variants: item.variants,
    //         }));

    //         const addressParts = orderData.address.split(',').map(part => part.trim());
    //         if (addressParts.length !== 5) {
    //             throw new Error('Invalid address format');
    //         }

    //         const [houseName, street, city, state, pinCode] = addressParts;

    //         const address = [{
    //             houseName,
    //             street,
    //             city,
    //             state,
    //             pinCode,
    //         }];

    //         const order = await this.orderRepository.createOrder({
    //             userId: new Types.ObjectId(orderData.userId),
    //             items: orderItems,
    //             address,
    //             location: orderData.location,
    //             phoneNumber: orderData.phoneNumber,
    //             payment: {
    //                 method: 'Cash',
    //                 status: 'Pending',
    //             },
    //             orderStatus: 'Pending',
    //             orderNumber: generateOrderPin(),
    //             totalAmount: orderData.total,
    //         });

    //         return { success: true, orderId: order._id };
    //     } catch (error) {
    //         return { success: false, error: `Order placement failed: ${(error as Error).message}` };
    //     }
    // }

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
            const { orderId, deliveryBoyId, deliveryBoyName, mobile, profileImage } = data;
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