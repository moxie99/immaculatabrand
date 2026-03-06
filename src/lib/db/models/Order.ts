import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Order status enum
 */
export type OrderStatus = 'new' | 'contacted' | 'completed' | 'cancelled';

/**
 * Order item interface
 */
export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  priceAtTime: number;
}

/**
 * Shipping address interface
 */
export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Order document interface
 * Represents a customer inquiry/order
 */
export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: IOrderItem[];
  message?: string;
  status: OrderStatus;
  shippingAddress?: IShippingAddress;
  createdAt: Date;
  updatedAt: Date;
  canTransitionTo(newStatus: OrderStatus): boolean;
}

/**
 * Order schema definition
 */
const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [200, 'Customer name cannot exceed 200 characters'],
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
      index: true,
      validate: {
        validator: function (email: string) {
          // Basic email validation regex
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Invalid email format',
      },
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        priceAtTime: {
          type: Number,
          required: true,
          min: [0, 'Price must be a positive number'],
        },
      },
    ],
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['new', 'contacted', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid order status',
      },
      default: 'new',
      index: true,
    },
    shippingAddress: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'orders',
  }
);

/**
 * Index on createdAt for sorting recent orders (descending)
 */
OrderSchema.index({ createdAt: -1 });

/**
 * Compound index for admin filtering by status and date
 */
OrderSchema.index({ status: 1, createdAt: -1 });

/**
 * Pre-save middleware to auto-generate order number
 * Format: ORD-YYYYMMDD-NNN (e.g., ORD-20240115-001)
 */
OrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = await generateOrderNumber(this.constructor as Model<IOrder>);
  }
  next();
});

/**
 * Pre-save middleware to validate status transitions
 */
OrderSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    // Get the original status from the database
    const originalDoc = (this as any).$locals.wasNew ? null : (this as any)._original;
    
    if (originalDoc && originalDoc.status) {
      const originalStatus = originalDoc.status;
      
      if (!isValidStatusTransition(originalStatus, this.status)) {
        return next(
          new Error(
            `Invalid status transition from ${originalStatus} to ${this.status}`
          )
        );
      }
    }
  }
  next();
});

/**
 * Post-init middleware to store original document state for status validation
 * This runs when a document is loaded from the database
 */
OrderSchema.post('init', function () {
  (this as any)._original = { status: this.status };
});

/**
 * Post-save middleware to update original document state
 * This runs after a document is saved, so subsequent updates can validate transitions
 */
OrderSchema.post('save', function () {
  (this as any)._original = { status: this.status };
});

/**
 * Helper function to generate order number
 * Format: ORD-YYYYMMDD-NNN
 */
async function generateOrderNumber(OrderModel: Model<IOrder>): Promise<string> {
  // Get current date in YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Find the highest order number for today
  const prefix = `ORD-${dateStr}-`;
  const lastOrder = await OrderModel.findOne({
    orderNumber: { $regex: `^${prefix}` },
  })
    .sort({ orderNumber: -1 })
    .limit(1);
  
  let sequence = 1;
  if (lastOrder && lastOrder.orderNumber) {
    // Extract sequence number from last order
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2], 10);
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }
  
  // Format sequence with leading zeros (3 digits)
  const sequenceStr = String(sequence).padStart(3, '0');
  
  return `${prefix}${sequenceStr}`;
}

/**
 * Helper function to validate status transitions
 * State machine rules:
 * - new -> contacted, cancelled
 * - contacted -> completed, cancelled
 * - completed -> (terminal state, no transitions)
 * - cancelled -> (terminal state, no transitions)
 */
function isValidStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    new: ['contacted', 'cancelled'],
    contacted: ['completed', 'cancelled'],
    completed: [], // Terminal state
    cancelled: [], // Terminal state
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Instance method to check if order can transition to a new status
 */
OrderSchema.methods.canTransitionTo = function (
  newStatus: OrderStatus
): boolean {
  return isValidStatusTransition(this.status, newStatus);
};

/**
 * Static method to generate unique order number
 * Exposed for testing and manual order creation
 */
OrderSchema.statics.generateOrderNumber = async function (): Promise<string> {
  return generateOrderNumber(this);
};

/**
 * Static method to validate status transition
 * Exposed for API validation before save
 */
OrderSchema.statics.isValidStatusTransition = function (
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  return isValidStatusTransition(currentStatus, newStatus);
};

// Prevent model recompilation in development (Next.js hot reload)
const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
