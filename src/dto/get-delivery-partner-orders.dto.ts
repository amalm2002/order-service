import { IOrder } from "../models/interfaces/order.interface";

export interface GetDeliveryPartnerOrdersDto {
    deliveryBoyId: string;
}

export interface GetDeliveryPartnerOrdersResponseDto {
  success: boolean;
  data?: IOrder[];
  error?: string;
}