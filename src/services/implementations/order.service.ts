
import { IOrderService } from '../interfaces/order.service.interface';
import { IOrderRepository } from '../../repositories/interfaces/order.repository.interface';
import { CreateOrderDto } from '../../dto/create.order.dto';
import { VerifyPaymentDto } from '../../dto/verify-payment.dto';
import { PlaceOrderDto } from '../../dto/place-order.dto';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createHash } from 'crypto';
import { Types } from 'mongoose';
import { IOrder } from '../../models/interfaces/order.interface';
import { generateOrderPin } from '../../util/order-number.util';
import redisClient from '../../config/redis.config';


export class OrderService implements IOrderService {
    private razorpay: Razorpay;
    private orderRepository: IOrderRepository;

    constructor(orderRepository: IOrderRepository) {
        this.orderRepository = orderRepository;
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_SECRET_ID || '',
        });
    }   
    
    private generateCartHash(cartItems: any[]): string {
        const cartString = JSON.stringify(
            cartItems.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price,
            })).sort((a, b) => a.id.localeCompare(b.id)) 
        );
        return createHash('sha256').update(cartString).digest('hex');
    }

    async createOrder(data: CreateOrderDto): Promise<any> {
        try {
            const { amount, userId, cartItems } = data;
            const cartHash = this.generateCartHash(cartItems);
            const lockKey = `order:lock:${userId}:${cartHash}`;
            const lockTTL = 30; 

            const lockAcquired = await redisClient.set(lockKey, 'locked', {
                EX: lockTTL,
                NX: true, 
            });

            if (!lockAcquired) {
                return { error: 'An order is already being processed for this cart. Please wait a moment and try again.' };
            }

            try {
                const payload = {
                    amount: amount * 100,
                    currency: 'INR',
                    receipt: `receipt_${new Date().getTime()}`,
                };
                const rawOrder = await this.razorpay.orders.create(payload);
                return {
                    orderId: rawOrder.id,
                    razorpayKey: process.env.RAZORPAY_KEY_ID,
                };
            } catch (error) {
                await redisClient.del(lockKey);
                throw error;
            }
        } catch (error) {
            console.error('Error in createOrder:', error);
            return { error: `Failed to create order: ${(error as Error).message}` };
        }
    }

    async verifyPayment(data: VerifyPaymentDto): Promise<any> {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = data;
            const razorData = razorpay_order_id + '|' + razorpay_payment_id;

            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_SECRET_ID || process.env.VITE_RAZORPAY_SECRET_ID || '')
                .update(razorData.toString())
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return { success: false, error: 'Invalid signature' };
            }

            const orderItems = orderData.cartItems.map(item => ({
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

            const addressParts = orderData.address.split(',').map(part => part.trim());
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
                userId: new Types.ObjectId(orderData.userId),
                items: orderItems,
                address,
                location: orderData.location,
                phoneNumber: orderData.phoneNumber,
                payment: {
                    method: 'UPI',
                    status: 'Success',
                    transactionId: orderData.paymentId,
                    paidAt: new Date(),
                },
                orderStatus: 'Pending',
                orderNumber: generateOrderPin(),
                totalAmount: orderData.total,
            });

            const cartHash = this.generateCartHash(orderData.cartItems);
            const lockKey = `order:lock:${orderData.userId}:${cartHash}`;
            await redisClient.del(lockKey);

            return { success: true, orderId: order._id };
        } catch (error) {
            const cartHash = this.generateCartHash(data.orderData.cartItems);
            const lockKey = `order:lock:${data.orderData.userId}:${cartHash}`;
            await redisClient.del(lockKey);
            return { success: false, error: `Payment verification failed: ${(error as Error).message}` };
        }
    }

    async placeOrder(data: PlaceOrderDto): Promise<any> {
        try {
            const { orderData } = data;
            const orderItems = orderData.cartItems.map(item => ({
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

            const addressParts = orderData.address.split(',').map(part => part.trim());
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
                userId: new Types.ObjectId(orderData.userId),
                items: orderItems,
                address,
                location: orderData.location,
                phoneNumber: orderData.phoneNumber,
                payment: {
                    method: 'Cash',
                    status: 'Pending',
                },
                orderStatus: 'Pending',
                orderNumber: generateOrderPin(),
                totalAmount: orderData.total,
            });

            return { success: true, orderId: order._id };
        } catch (error) {
            return { success: false, error: `Order placement failed: ${(error as Error).message}` };
        }
    }
    
    
    // async createOrder(data: CreateOrderDto): Promise<any> {
    //     try {
    //         const { amount, userId } = data;
    //         const payload = {
    //             amount: amount * 100,
    //             currency: 'INR',
    //             receipt: `receipt_${new Date().getTime()}`,
    //         }
    //         const rawOrder = await this.razorpay.orders.create(payload);
    //         return {
    //             orderId: rawOrder.id,
    //             razorpayKey: process.env.RAZORPAY_KEY_ID,
    //         };
    //     } catch (error) {
    //         console.log(error);

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
    //         // console.log('seve order in service side :', order);

    //         return { success: true, orderId: order._id };
    //     } catch (error) {
    //         return { success: false, error: `Payment verification failed: ${(error as Error).message}` };
    //     }
    // }

    // async placeOrder(data: PlaceOrderDto): Promise<any> {
    //     try {

    //         const { orderData } = data
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

    async getAllRestaurantOrder(restaurantId: string): Promise<any> {
        try {
            // console.log(restaurantId,'data from the frontend');

            const orders = await this.orderRepository.getOrdersByRestaurantId(restaurantId);
            console.log('order is :', orders);

            return { success: true, data: orders };
        } catch (error) {
            return { success: false, error: `Order fetching failed: ${(error as Error).message}` };
        }
    }

    async changeTheOrderStatus(data: { orderId: string; orderStatus: string; }): Promise<any> {
        try {
            const orderStatusResponse = await this.orderRepository.changeTheOrderStatus(data)
            return orderStatusResponse
        } catch (error) {
            return { success: false, error: `Order Stauts Change failed: ${(error as Error).message}` };
        }
    }

    async getUserOrder(data: { userId: string; }): Promise<{ success: boolean; data?: IOrder[]; error?: string }> {
        try {
            return await this.orderRepository.getUserOrder(data)
        } catch (error) {
            return { success: false, error: `Get User Order failed: ${(error as Error).message}` };
        }
    }

    async getOrderDetails(data: { orderId: string; }): Promise<any> {
        try {
            return await this.orderRepository.getOrderDetails(data)
        } catch (error) {
            return { success: false, error: `Get User Order failed: ${(error as Error).message}` };
        }
    }

    async cancelOrder(data: { orderId: string }): Promise<any> {
        console.log('service ', data);

        const order = await this.orderRepository.findOrderById(data.orderId);
        console.log('order :', order);

        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        const canCancel = !['Picked', 'Delivered', 'Cancelled'].includes(order.orderStatus);
        console.log('canCancel :', canCancel);
        if (!canCancel) {
            return { success: false, message: 'Order cannot be cancelled' };
        }



        const updatedOrder = await this.orderRepository.updateOrderStatus(data.orderId, 'Cancelled');

        console.log('updateOrder :', updatedOrder);


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

    async updateDeliveryBoy(data: {
        orderId: string;
        deliveryBoyId: string;
        deliveryBoyName: string;
        mobile: string;
        profileImage?: string;
    }): Promise<{ success: boolean; message: string }> {
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

    async removeDeliveryBoy(data: { orderId: string }): Promise<{ success: boolean; message: string }> {
        try {
            const { orderId } = data;
            // console.log('Removing delivery boy for order:', orderId);

            const order = await this.orderRepository.findOrderById(orderId);
            if (!order) {
                // console.log('Order not found:', orderId);
                return { success: false, message: 'Order not found' };
            }

            const updatedOrder = await this.orderRepository.removeDeliveryBoy(orderId);
            if (!updatedOrder) {
                // console.log('Failed to remove delivery boy for order:', orderId);
                return { success: false, message: 'Failed to remove delivery boy' };
            }

            await this.orderRepository.updateOrderStatus(orderId, 'Pending');
            // console.log('Delivery boy removed and order status reverted to Pending:', orderId);

            return { success: true, message: 'Delivery boy removed successfully' };
        } catch (error) {
            console.error('Error in removeDeliveryBoy:', error);
            return { success: false, message: `Failed to remove delivery boy: ${(error as Error).message}` };
        }
    }

    async verifyOrderNumber(data: { enteredPin: number; orderId: string; }): Promise<{ success: boolean; message: string; location?: { latitude: number, longitude: number }; userId?: string }> {
        try {
            const { enteredPin, orderId } = data
            // console.log('data fron the frontend :', data);
            const order = await this.orderRepository.findOrderById(orderId)
            // console.log('order is getting :', order);

            if (!order) {
                // console.log('Order not found:', orderId);
                return { success: false, message: 'Order not found' };
            }
            const userLocation = order.location
            const convertToNumber = Number(enteredPin)
            if (order.orderNumber === convertToNumber) {
                // console.log('hello ');
                await this.orderRepository.updateOrderStatus(orderId, 'Picked')
                return { success: true, message: 'PIN verified successfully', location: userLocation, userId: order.userId };
            } else {
                // console.log('hiiiiii ');
                return { success: false, message: 'Entered PIN does not match the order' };
            }

        } catch (error) {
            console.error('Error in verifyOrderNumber:', error);
            return { success: false, message: `Failed to verify order number: ${(error as Error).message}` };
        }
    }

    async completeDelivery(data: { orderId: string }): Promise<any> {
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

    async getDeliveryPartnerOrders(data: { deliveryBoyId: string; }): Promise<{ success: boolean; data?: IOrder[]; error?: string; }> {
        try {
            const { deliveryBoyId } = data
            const orders = await this.orderRepository.getOrdersByDeliveryBoyId(deliveryBoyId)
            return orders
        } catch (error) {
            console.error('Error in get delivery partner orders:', error);
            return { success: false, error: `Error on get delivery partner orders : ${(error as Error).message}` };
        }
    }

}