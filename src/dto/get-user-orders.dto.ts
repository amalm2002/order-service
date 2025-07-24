export interface GetUserOrdersDto {
    userId: string
}

export interface GetUserOrdersResponseDto {
    success?: boolean
    error?: string
    data?: any
}