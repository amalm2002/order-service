import mongoose, { Schema } from "mongoose";
import { IOrder } from "./interfaces/order.interface";

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true }
}, { _id: true });

const OrderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  orderNumber: { type: Number, required: true, unique: true },
  orderId: { type: String },

  items: [
    {
      foodId: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },

      restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant" },
      restaurantName: { type: String },

      name: { type: String, required: true },
      description: { type: String, required: true },
      category: { type: String, required: true },
      images: [{ type: String }],
      hasVariants: { type: Boolean, default: false },
      variants: [
        {
          name: { type: String },
          price: { type: Number },
          quantity: { type: Number }
        }
      ]
    }
  ],

  address: { type: [AddressSchema], required: true },

  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },

  phoneNumber: { type: String, required: true },

  payment: {
    method: {
      type: String,
      enum: ["Cash", "Card", "UPI", "NetBanking"],
      required: true
    },
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending"
    },
    transactionId: { type: String },
    paidAt: { type: Date }
  },

  orderStatus: {
    type: String,
    enum: ["Pending", "Accepted", "Preparing", "Packed", "Picked", "Delivered", "Cancelled"],
    default: "Pending"
  },
  deliveryBoy: {
    id: { type: Schema.Types.ObjectId, ref: "DeliveryBoy" },
    name: { type: String },
    mobile: { type: String },
    profileImage: { type: String }
  },

  totalAmount: { type: Number, required: true },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
export default OrderModel;
