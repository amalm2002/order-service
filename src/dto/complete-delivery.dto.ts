export interface CompleteDeliveryDto {
    orderId: string;
}

export interface CompleteDeliveryResponseDto {
    success: boolean;
    message: string;
    data?: {
        _id: string;
        userId: string;
        orderNumber: number;
        items: {
            foodId: string;
            quantity: number;
            price: number;
            restaurantId: string;
            restaurantName: string;
            name: string;
            description: string;
            category: string;
            images: string[];
            hasVariants: boolean;
            variants: any[];
            _id: string;
        }[];
        address: {
            street: string;
            city: string;
            state: string;
            pinCode: string;
            _id: string;
        }[];
        location: {
            latitude: number;
            longitude: number;
        };
        phoneNumber: string;
        payment: {
            method: string;
            status: string;
        };
        orderStatus: string;
        totalAmount: number;
        createdAt: Date | string;
        __v: number;
        deliveryBoy: {
            id: string;
            name: string;
            mobile: string;
            profileImage: string;
        };
    }
}
