
import { Types } from "mongoose";

export interface IAddress {
  _id?: Types.ObjectId;
  street: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface IOrderItem {
  foodId: Types.ObjectId;
  quantity: number;
  price: number;
  restaurantId?: string | undefined;
  restaurantName: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  hasVariants: boolean;
  variants?: {
    name: string;
    price: number;
    quantity: number;
  }[];
}


export interface IPayment {
  method: "Cash" | "Card" | "UPI" | "NetBanking";
  status: "Pending" | "Success" | "Failed";
  transactionId?: string;
  paidAt?: Date;
}

export interface IOrder {
  _id: Types.ObjectId
  userId: Types.ObjectId;
  userName:string;
  orderNumber:number;
  orderId: string
  items: IOrderItem[];
  address: IAddress[];
  location: {
    latitude: number;
    longitude: number;
  };
  phoneNumber: string;
  payment: IPayment;
  orderStatus: "Pending" | "Preparing" | "Picked" | "Delivered" | "Cancelled";
  deliveryBoy:{
    _id:Types.ObjectId;
    name:string;
    mobile:string;
    profileImage:string;
    totalDeliveries?:number;
    rating?:number
  }
  totalAmount: number;
  createdAt?: Date;
}
