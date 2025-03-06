import { supabase } from '../lib/supabase';

/**
 * Get all tables
 */
export async function getTables() {
  try {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('number');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting tables:', error);
    throw error;
  }
}

/**
 * Create a new table
 */
export async function createTable(tableData) {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('You must be authenticated to perform this action');
    }

    const { data, error } = await supabase
      .from('tables')
      .insert([{
        ...tableData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('A table with this number already exists');
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
}

/**
 * Update a table
 */
export async function updateTable(tableId, updates) {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('You must be authenticated to perform this action');
    }

    const { data, error } = await supabase
      .from('tables')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', tableId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('A table with this number already exists');
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error updating table:', error);
    throw error;
  }
}

/**
 * Toggle table active status
 */
export async function toggleTableStatus(tableId, isActive) {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('You must be authenticated to perform this action');
    }

    const { data, error } = await supabase
      .from('tables')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', tableId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling table status:', error);
    throw error;
  }
}

/**
 * Get table occupancy for a specific date
 */
export async function getTableOccupancy(date) {
  try {
    const { data: tables, error: tablesError } = await supabase
      .from('tables')
      .select('id, number, capacity')
      .eq('is_active', true);

    if (tablesError) throw tablesError;

    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('table_id, time')
      .eq('date', date)
      .in('status', ['confirmed', 'pending']);

    if (reservationsError) throw reservationsError;

    // Create occupancy map for each table
    const occupancyMap = tables.map(table => {
      const tableReservations = reservations.filter(res => res.table_id === table.id);
      return {
        ...table,
        reservations: tableReservations.map(res => res.time)
      };
    });

    return occupancyMap;
  } catch (error) {
    console.error('Error getting table occupancy:', error);
    throw error;
  }
}

/**
 * Get table analytics
 */
export async function getTableAnalytics(startDate, endDate) {
  try {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        table_id,
        tables(number, capacity),
        date,
        time,
        party_size,
        status
      `)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    // Process analytics
    const analytics = {
      totalReservations: reservations.length,
      averagePartySize: reservations.reduce((acc, res) => acc + res.party_size, 0) / reservations.length,
      tableUtilization: {},
      peakHours: {},
      cancellationRate: 0
    };

    // Calculate table utilization
    reservations.forEach(res => {
      const tableId = res.table_id;
      analytics.tableUtilization[tableId] = (analytics.tableUtilization[tableId] || 0) + 1;
      
      // Track peak hours
      const hour = res.time.split(':')[0];
      analytics.peakHours[hour] = (analytics.peakHours[hour] || 0) + 1;
    });

    // Calculate cancellation rate
    const cancelledReservations = reservations.filter(res => res.status === 'cancelled').length;
    analytics.cancellationRate = (cancelledReservations / reservations.length) * 100;

    return analytics;
  } catch (error) {
    console.error('Error getting table analytics:', error);
    throw error;
  }
}
