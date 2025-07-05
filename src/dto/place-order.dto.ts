
// export interface PlaceOrderDto {
//     // userId: string;
//     // cartItems: {
//     //     id: string;
//     //     name: string;
//     //     description: string;
//     //     price: number;
//     //     quantity: number;
//     //     image: string;
//     //     restaurant: string;
//     //     isVeg: boolean;
//     //     maxAvailableQty: number;
//     // }[];
//     // subtotal: number;
//     // deliveryFee: number;
//     // tax: number;
//     // total: number;
//     // location: {
//     //     latitude: number;
//     //     longitude: number;
//     // };
//     // address: string;
//     // phoneNumber: string;
//     // paymentMethod: 'cod';

//      orderData: {
//         userId: string;
//         cartItems: {
//             id: string;
//             name: string;
//             description: string;
//             price: number;
//             quantity: number;
//             image: string;
//             restaurant: string;
//             isVeg: boolean;
//             maxAvailableQty: number;
//         }[];
//         subtotal: number;
//         deliveryFee: number;
//         tax: number;
//         total: number;
//         location: {
//             latitude: number;
//             longitude: number;
//         };
//         address: string;
//         phoneNumber: string;
//         paymentMethod: 'cod';
//     };
// }



export interface PlaceOrderDto {
  orderData: {
    userId: string;
    cartItems: {
      id: string;
      name: string;
      description: string;
      price: number;
      quantity: number;
      images: string[];
      restaurantId: string;
      restaurant: string;
      category: string;
      discount: number;
      timing: string;
      rating: number;
      hasVariants: boolean;
      variants: { name: string; price: number; quantity: number }[];
      maxAvailableQty: number;
    }[];
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    location: {
      latitude: number;
      longitude: number;
    };
    address: string;
    phoneNumber: string;
    paymentMethod: 'cod';
  };
}