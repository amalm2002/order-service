export interface GetOrderDetailsDto {
    orderId: string;
}

export interface GetOrderDetailsResponseDto {
    success: boolean;
    // data?: any
    data?: {
        payment: {
            method: string;
            status: string;
            transactionId: string;
            paidAt: Date | string;
        };
        deliveryBoy: {
            id: string;
            name: string;
            mobile: string;
            profileImage: string;
            rating?: number;
            totalDeliveries?: number;
        };
        id: string;
        userId: string;
        orderNumber: number;
        items: {
            foodId: string;
            name: string;
            description: string;
            price: number;
            quantity: number;
            images: string[];
            category: string;
            hasVariants: boolean;
            variants: { name: string; price: number; quantity: number }[];
            restaurantId: string;
            restaurantName: string;
        }[];
        address: {
            street?: string;
            city?: string;
            district?: string;
            pincode?: string;
            [key: string]: any;
        }[];
        phoneNumber: string;
        orderStatus: string;
        totalAmount: number;
        createdAt: Date | string;
        __v: number;
    };

    error?: string
}

