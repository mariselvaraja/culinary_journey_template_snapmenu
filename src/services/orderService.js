import { supabase } from '../lib/supabase';

export const orderService = {
  async createOrder(orderData) {
    try {
      // Start a transaction
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail,
          customer_phone: orderData.customerPhone,
          order_type: orderData.orderType,
          status: 'pending',
          pickup_time: orderData.pickupTime,
          total_amount: orderData.totalAmount,
          payment_method: orderData.paymentMethod,
          device_type: orderData.deviceType,
          user_agent: navigator.userAgent,
          ip_address: '', // Will be set by server
          notes: orderData.notes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        item_id: item.id,
        item_name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        customizations: item.customizations || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Return order with items
      const { data: orderWithItems, error: getOrderError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', order.id)
        .single();

      if (getOrderError) throw getOrderError;

      return { order: orderWithItems, items: orderItems };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async getOrder(orderId) {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select(`
          *,
          items:order_items(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  async getOrdersByCustomer(email) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('customer_email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  },

  async getOrdersByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      throw error;
    }
  },

  async getOrders({
    page = 1,
    limit = 20,
    status = null,
    startDate = null,
    endDate = null,
    searchTerm = null
  }) {
    try {
      let query = supabase
        .from('orders')
        .select('*, items:order_items(*)', { count: 'exact' });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }

      if (startDate) {
        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0);
        query = query.gte('created_at', startDateTime.toISOString());
      }

      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDateTime.toISOString());
      }

      if (searchTerm) {
        query = query.or(`customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,customer_phone.ilike.%${searchTerm}%`);
      }

      // Add sorting
      query = query.order('created_at', { ascending: false });

      // Add pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      if (!data) {
        console.log('No orders found');
        return {
          orders: [],
          total: 0,
          currentPage: page,
          totalPages: 0
        };
      }

      console.log(`Found ${data.length} orders`);
      return {
        orders: data,
        total: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error in getOrders:', error);
      throw error;
    }
  }
};
