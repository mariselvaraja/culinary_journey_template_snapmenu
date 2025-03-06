import { publicClient } from '@/lib/supabase';

export async function createReservation(data) {
  console.log('Creating reservation with data:', data);

  try {
    // First check if a table is available
    const { data: availabilityCheck, error: availabilityError } = await publicClient
      .rpc('check_table_availability', {
        p_date: data.reservation_date,
        p_time: data.reservation_time,
        p_party_size: Number(data.party_size)
      });

    if (availabilityError) {
      console.error('Error checking table availability:', availabilityError);
      throw new Error(availabilityError.message || 'Failed to check table availability');
    }

    if (!availabilityCheck || !availabilityCheck.length) {
      throw new Error('No availability data returned from server');
    }

    console.log('Table availability check result:', availabilityCheck[0]);

    if (!availabilityCheck[0].available) {
      throw new Error(availabilityCheck[0].message || 'No tables available for this party size at the selected time');
    }

    // Get current user ID if authenticated
    const { data: { user }, error: userError } = await publicClient.auth.getUser();
    const userId = user?.id;

    // Ensure party_size is a number and include the assigned table_id
    const reservationData = {
      ...data,
      party_size: Number(data.party_size),
      table_id: availabilityCheck[0].table_id,
      status: 'pending', // Default to pending, admin can confirm
      user_id: userId // Add user_id if authenticated
    };

    console.log('Processed reservation data:', reservationData);

    const { data: result, error } = await publicClient
      .from('reservations')
      .insert([reservationData])
      .select(`
        *,
        table:tables (
          id,
          number,
          capacity,
          section,
          status
        )
      `)
      .single();

    if (error) {
      console.error('Error creating reservation:', error);
      throw new Error(error.message || 'Failed to create reservation');
    }

    if (!result) {
      throw new Error('No result returned after creating reservation');
    }

    console.log('Reservation created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error in createReservation:', error);
    throw error;
  }
}

export async function getReservations(startDate, endDate) {
  console.log('Fetching reservations:', { startDate, endDate });

  try {
    const { data, error } = await publicClient
      .from('reservations')
      .select(`
        *,
        table:tables (
          id,
          number,
          capacity,
          section,
          status
        )
      `)
      .gte('reservation_date', startDate)
      .lte('reservation_date', endDate)
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true });

    if (error) {
      console.error('Error fetching reservations:', error);
      throw new Error(error.message || 'Failed to fetch reservations');
    }

    if (!data) {
      console.log('No reservations found');
      return [];
    }

    // Ensure party_size is a number in all results
    const processedData = data.map(reservation => ({
      ...reservation,
      party_size: Number(reservation.party_size)
    }));

    console.log('Fetched reservations:', processedData);
    return processedData;
  } catch (error) {
    console.error('Error in getReservations:', error);
    throw error;
  }
}

export async function updateReservationStatus(id, status) {
  console.log('Updating reservation status:', { id, status });

  try {
    const { data, error } = await publicClient
      .from('reservations')
      .update({ "status" : status })
      .eq('id', id)
      .select(`
        *,
        table:tables (
          id,
          number,
          capacity,
          section,
          status
        )
      `)
      .single();

    if (error) {
      console.error('Error updating reservation status:', error);
      throw new Error(error.message || 'Failed to update reservation status');
    }

    if (!data) {
      throw new Error('No reservation found with the provided ID');
    }

    // Ensure party_size is a number in the result
    const processedData = {
      ...data,
      party_size: Number(data.party_size)
    };

    console.log('Reservation status updated:', processedData);
    return processedData;
  } catch (error) {
    console.error('Error in updateReservationStatus:', error);
    throw error;
  }
}

export async function getReservation(id) {
  console.log('Fetching reservation:', id);

  try {
    const { data, error } = await publicClient
      .from('reservations')
      .select(`
        *,
        table:tables (
          id,
          number,
          capacity,
          section,
          status
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching reservation:', error);
      throw new Error(error.message || 'Failed to fetch reservation');
    }

    if (!data) {
      throw new Error('No reservation found with the provided ID');
    }

    // Ensure party_size is a number in the result
    const processedData = {
      ...data,
      party_size: Number(data.party_size)
    };

    console.log('Fetched reservation:', processedData);
    return processedData;
  } catch (error) {
    console.error('Error in getReservation:', error);
    throw error;
  }
}

export async function getTableAvailability(date, time, partySize) {
  console.log('Checking table availability:', { date, time, partySize });

  try {
    const { data, error } = await publicClient
      .rpc('check_table_availability', {
        p_date: date,
        p_time: time,
        p_party_size: Number(partySize)
      });

    if (error) {
      console.error('Error checking table availability:', error);
      throw new Error(error.message || 'Failed to check table availability');
    }

    if (!data || !data.length) {
      throw new Error('No availability data returned from server');
    }

    console.log('Table availability result:', data[0]);
    return data[0]; // Returns { available: boolean, message: string, table_id: uuid }
  } catch (error) {
    console.error('Error in getTableAvailability:', error);
    throw error;
  }
}
