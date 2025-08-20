export interface GetUserOrdersDto {
    userId: string;
    page?: number;
    limit?: number;
}

export interface GetUserOrdersResponseDto {
    success?: boolean
    error?: string
    data?: {
        orders: any[]; 
        totalOrders: number;
        currentPage: number;
        totalPages: number;
    }
}