export interface UpdateDeliveryBoyDto {
    orderId: string;
    deliveryBoyId: string;
    deliveryBoyName: string;
    mobile: string;
    profileImage?: string
    totalDeliveries?:number
}

export interface UpdateDeliveryBoyResponseDto {
    success: boolean;
    message: string
}