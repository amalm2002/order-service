
// export interface CreateOrderDto {
//     amount: number;
//     userId: string;
//     cartItems: any[]
// }

export interface LocationDTO {
    latitude: number;
    longitude: number;
}

export interface CartItemDTO {
    images: string[];
    variants: any[];
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    restaurantId: string;
    restaurant: string;
    category: string;
    discount: number;
    timing: string;
    rating: number;
    hasVariants: boolean;
    maxAvailableQty: number;
}

export class CreateOrderDTO {
    userId: string;
    userName?: string;
    cartItems: CartItemDTO[];
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    address: string;
    phoneNumber: string;
    paymentMethod: 'cod' | 'upi' | 'card';
    location: LocationDTO;
}

export interface CreateOrderResponseDTO {
    success: boolean;
    orderId?: any;
    error?: string;
}