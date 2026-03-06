/**
 * Order type definitions
 * These types align with the Order Mongoose schema
 */

/**
 * Order status enum
 * State machine: new -> contacted/cancelled, contacted -> completed/cancelled
 */
export type OrderStatus = 'new' | 'contacted' | 'completed' | 'cancelled';

/**
 * Order item interface
 * Represents a product in an order with quantity and price snapshot
 */
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtTime: number;
}

/**
 * Shipping address interface
 */
export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Order interface
 * Represents a customer inquiry/order
 */
export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  message?: string;
  status: OrderStatus;
  shippingAddress?: ShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order creation input (without auto-generated fields)
 */
export interface OrderCreateInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  message?: string;
  shippingAddress?: ShippingAddress;
}

/**
 * Order update input (typically just status updates)
 */
export interface OrderUpdateInput {
  status?: OrderStatus;
  message?: string;
}
