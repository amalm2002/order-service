export interface DashboardStatsDto {
  restaurantId: string;
  period: 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface DashboardStatsResponseDto {
  success: boolean;
  data?: {
    revenueData: { name: string; value: number }[];
    topItems: { name: string; value: number }[];
    totalOrders: number;
    totalSales: number;
    totalProfit: number;
    recentOrders: IOrder[];
  };
  error?: string;
}

export interface IOrder {
  _id: string;
  orderId: string;
  userId: string;
  userName?: string;
  items: {
    foodId: string;
    name: string;
    quantity: number;
    price: number;
    category: string;
    description: string;
    images: string[];
    hasVariants: boolean;
    variants: { name: string; price: number; quantity: number }[];
    restaurantId: string;
    restaurantName: string;
  }[];
  address: { street: string; city: string; state: string; pinCode: string }[];
  phoneNumber: string;
  payment: { method: string; status: string };
  orderStatus: 'Pending' | 'Preparing' | 'Packed' | 'Delivered' | 'Cancelled'|'Picked';
  orderNumber: number;
  totalAmount: number;
  createdAt: string;
}