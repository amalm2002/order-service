export interface GetAllRestaurantOrdersDto {
  restaurantId: string
  page?: number;
  limit?: number;
}

export interface OrderLocationDto {
  latitude: number;
  longitude: number;
}

export interface OrderPaymentDto {
  method: 'Cash' | 'Card' | 'UPI' | 'NetBanking';
  status: 'Pending' | 'Success' | 'Failed';
  transactionId?: string;
  paidAt?: Date;
}

export interface DeliveryBoyDto {
  _id: string;
  name: string;
  mobile: string;
  profileImage: string;
}

export interface OrderItemVariantDto {
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItemDto {
  foodId: string;
  quantity: number;
  price: number;
  restaurantId?: string;
  restaurantName: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  hasVariants: boolean;
  variants?: OrderItemVariantDto[];
}

export interface OrderAddressDto {
  street: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface RestaurantOrderResponseDto {
  success: boolean;
  data?: {
    orders: any;
    totalOrders: number;
    currentPage: number;
    totalPages: number;
  };
  error?: string;
}
