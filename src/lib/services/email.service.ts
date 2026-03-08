import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

interface OrderItem {
  productId: string | mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  priceAtTime: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface OrderWithId {
  _id: string | mongoose.Types.ObjectId;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  message?: string;
  status: string;
  shippingAddress?: ShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface SendOrderNotificationParams {
  order: OrderWithId;
}

export async function sendOrderNotificationEmail({
  order,
}: SendOrderNotificationParams): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const fromEmail = process.env.EMAIL_FROM;

  if (!adminEmail || !fromEmail) {
    logger.warn('Email not configured - skipping notification', {
      hasAdminEmail: !!adminEmail,
      hasFromEmail: !!fromEmail,
    });
    return;
  }

  const itemsList = order.items
    .map(
      (item) =>
        `- ${item.productName} (Qty: ${item.quantity}) - $${item.priceAtTime.toFixed(2)}`
    )
    .join('\n');

  const shippingInfo = order.shippingAddress
    ? `
Shipping Address:
${order.shippingAddress.street}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}
${order.shippingAddress.country}`
    : 'No shipping address provided';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">New Order Received</h2>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      
      <h3 style="color: #333;">Customer Information</h3>
      <p><strong>Name:</strong> ${order.customerName}</p>
      <p><strong>Email:</strong> ${order.customerEmail}</p>
      <p><strong>Phone:</strong> ${order.customerPhone}</p>
      
      <h3 style="color: #333;">Order Details</h3>
      <ul style="list-style: none; padding: 0;">
        ${order.items
          .map(
            (item) => `
          <li style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${item.productName}</strong><br>
            Quantity: ${item.quantity} | Price: $${item.priceAtTime.toFixed(2)}
          </li>
        `
          )
          .join('')}
      </ul>
      
      ${
        order.message
          ? `
        <h3 style="color: #333;">Customer Message</h3>
        <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${order.message}</p>
      `
          : ''
      }
      
      <h3 style="color: #333;">Shipping Address</h3>
      <p>${
        order.shippingAddress
          ? `
        ${order.shippingAddress.street}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
        ${order.shippingAddress.country}
      `
          : 'No shipping address provided'
      }</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">This is an automated notification from Immaculate Brand.</p>
    </div>
  `;

  const textContent = `
New Order Received - ${order.orderNumber}

Customer Information:
- Name: ${order.customerName}
- Email: ${order.customerEmail}
- Phone: ${order.customerPhone}

Order Details:
${itemsList}

${order.message ? `Customer Message:\n${order.message}\n` : ''}
${shippingInfo}

View this order in the admin panel.
  `.trim();

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: adminEmail,
      subject: `New Order - ${order.orderNumber} - Immaculate Brand`,
      text: textContent,
      html: htmlContent,
    });

    logger.info('Order notification email sent', {
      orderNumber: order.orderNumber,
      adminEmail,
    });
  } catch (error) {
    logger.error('Failed to send order notification email', {
      orderNumber: order.orderNumber,
      error,
    });
    throw error;
  }
}
