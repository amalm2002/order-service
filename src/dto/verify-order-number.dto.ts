export interface VerifyOrderNumberDto {
    enteredPin: number;
    orderId: string;
}

export interface VerifyOrderNumberResponseDto {
    success: boolean;
    message: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    userId?: string;
}