export interface CancelOrderDto {
    orderId: string;
}

export interface CancelOrderResponseDto {
    success: boolean;
    message: string;
    refundRequired?: boolean;
    refundData?: {
        userId: string;
        amount: number;
        restaurantId: string | undefined;
        items: {
            foodId: string;
            quantity: number;
        }[];
    };
}
