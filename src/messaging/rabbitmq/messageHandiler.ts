import { OrderController } from '../../controller/implementations/order.controller';
import RabbitMQClient from './client';

export class MessageHandler {
    static async handle(
        operation: string,
        data: any,
        correlationId: string,
        replyTo: string,
        controllers: {
            orderController: OrderController;
        }
    ) {
        const { orderController } = controllers;
        let response;

        console.log('Operation:', operation, 'Data:', data);

        switch (operation) {
            case 'Get-All-Restaurant-Orders':
                response = await orderController.getAllRestaurantOrders(data);
                break;
            case 'Get-Dashboard-Stats':
                response = await orderController.getDashboardStats(data);
                break;
            case 'Change-Order-Status':
                response = await orderController.changeTheOrderStatus(data);
                break;
            case 'Get-User-Order':
                response = await orderController.getUserOrders(data);
                break;
            case 'Get-Order-Details':
                response = await orderController.getOrderDetails(data);
                break;
            case 'Cancel-Order':
                response = await orderController.cancelOrder(data);
                break;
            case 'Assign-Delivery-Boy':
                response = await orderController.updateDeliveryBoy(data);
                break;
            case 'Remove-Delivery-Boy':
                response = await orderController.removeDeliveryBoy(data);
                break;
            case 'Verify-Order-Number':
                response = await orderController.verifyOrderNumber(data);
                break;
            case 'Complete-Delivery':
                response = await orderController.completeDelivery(data);
                break;
            case 'Get-Delivery-Partner-Orders':
                response = await orderController.getDeliveryPartnerOrders(data);
                break;
            case 'Create-COD-Order':
                response = await orderController.createCashOnDeliveryOrder(data);
                break;
            case 'Create-UPI-Order':
                response = await orderController.createUPIOrder(data);
                break;
            default:
                response = { error: 'Unknown operation' };
        }

        await RabbitMQClient.produce(response, correlationId, replyTo);
    }
}