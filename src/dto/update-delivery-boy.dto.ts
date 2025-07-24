export interface UpdateDeliveryBoyDto {
    orderId: string;
    deliveryBoyId: string;
    deliveryBoyName: string;
    mobile: string;
    profileImage?: string
}

export interface UpdateDeliveryBoyResponseDto {
    success: boolean;
    message: string
}