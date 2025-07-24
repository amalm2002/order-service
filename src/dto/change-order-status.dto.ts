export interface ChangeOrderStatusDto {
    orderId: string;
    orderStatus: string;
}

export interface ChangeOrderStatusResponseDto {
    _id?: string;
    orderStatus?: string
    success?: boolean;
    error?: string
}