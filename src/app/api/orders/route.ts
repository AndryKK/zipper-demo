import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Inventory from '@/lib/models/Inventory';
import Customer from '@/lib/models/Customer';
import { generateOrderNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: Record<string, unknown> = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(limit);
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const orderNumber = generateOrderNumber();
    const order = await Order.create({ ...body, orderNumber });

    // Update inventory
    for (const item of order.items) {
      await Inventory.findOneAndUpdate(
        { variantArticle: item.variantArticle, warehouse: order.warehouse },
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Update customer stats
    await Customer.findOneAndUpdate(
      { phone: order.customer.phone },
      { $inc: { totalOrders: 1, totalSpent: order.totalAmount } },
      { upsert: false }
    );

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
