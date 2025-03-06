import { supabase } from '../lib/supabase';

/**
 * Add customer to waitlist
 */
export async function addToWaitlist(waitlistData) {
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{
        ...waitlistData,
        status: 'waiting',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    throw error;
  }
}

/**
 * Get waitlist entries for a specific date
 */
export async function getWaitlist(date) {
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting waitlist:', error);
    throw error;
  }
}

/**
 * Update waitlist entry status
 */
export async function updateWaitlistStatus(id, status) {
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating waitlist status:', error);
    throw error;
  }
}

/**
 * Convert waitlist entry to reservation
 */
export async function convertToReservation(waitlistId, reservationData) {
  try {
    // Start a transaction
    const { error: transactionError } = await supabase.rpc('begin_transaction');
    if (transactionError) throw transactionError;

    try {
      // Create the reservation
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert([{
          ...reservationData,
          status: 'confirmed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (reservationError) throw reservationError;

      // Update waitlist status
      const { error: waitlistError } = await supabase
        .from('waitlist')
        .update({
          status: 'converted',
          updated_at: new Date().toISOString()
        })
        .eq('id', waitlistId);

      if (waitlistError) throw waitlistError;

      // Commit transaction
      const { error: commitError } = await supabase.rpc('commit_transaction');
      if (commitError) throw commitError;

      return reservation;
    } catch (error) {
      // Rollback transaction on error
      await supabase.rpc('rollback_transaction');
      throw error;
    }
  } catch (error) {
    console.error('Error converting waitlist to reservation:', error);
    throw error;
  }
}

/**
 * Send waitlist notification email
 */
export async function sendWaitlistNotification(waitlistEntry, availableTime) {
  try {
    // Update waitlist status to notified
    const { error: updateError } = await supabase
      .from('waitlist')
      .update({
        status: 'notified',
        updated_at: new Date().toISOString()
      })
      .eq('id', waitlistEntry.id);

    if (updateError) throw updateError;

    // Store notification email
    const { error: emailError } = await supabase
      .from('emails')
      .insert([{
        to_email: waitlistEntry.email,
        subject: 'Table Available - Waitlist Notification',
        content: `
          Dear ${waitlistEntry.customer_name},

          Good news! A table has become available for your preferred time.

          Details:
          Date: ${new Date(waitlistEntry.date).toLocaleDateString()}
          Time: ${availableTime}
          Party Size: ${waitlistEntry.party_size} ${waitlistEntry.party_size === 1 ? 'Guest' : 'Guests'}

          Please visit the following link to confirm your reservation:
          ${window.location.origin}/reserve?date=${waitlistEntry.date}&time=${availableTime}&party_size=${waitlistEntry.party_size}

          This availability is time-sensitive and will be offered to the next person on the waitlist if not claimed within 2 hours.

          If you no longer need this reservation, no action is required.

          Best regards,
          Maison Restaurant
        `,
        status: 'sent',
        created_at: new Date().toISOString()
      }]);

    if (emailError) throw emailError;
  } catch (error) {
    console.error('Error sending waitlist notification:', error);
    throw error;
  }
}

/**
 * Check waitlist for available tables
 */
export async function checkWaitlistAvailability(date) {
  try {
    // Get waiting entries for the date
    const { data: waitingEntries, error: waitlistError } = await supabase
      .from('waitlist')
      .select('*')
      .eq('date', date)
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });

    if (waitlistError) throw waitlistError;

    // For each waiting entry, check if their preferred time or nearby times are available
    for (const entry of waitingEntries) {
      const timeSlots = [
        entry.preferred_time,
        // Add 30 minutes
        new Date(`2000-01-01T${entry.preferred_time}`).getTime() + 30 * 60000,
        // Subtract 30 minutes
        new Date(`2000-01-01T${entry.preferred_time}`).getTime() - 30 * 60000
      ].map(time => {
        if (typeof time === 'number') {
          return new Date(time).toTimeString().slice(0, 5);
        }
        return time;
      });

      for (const time of timeSlots) {
        const { data: availability } = await supabase.rpc('check_table_availability', {
          check_date: date,
          check_time: time,
          required_capacity: entry.party_size
        });

        if (availability && availability.available) {
          // Notify customer of availability
          await sendWaitlistNotification(entry, time);
          break; // Move to next waiting entry
        }
      }
    }
  } catch (error) {
    console.error('Error checking waitlist availability:', error);
    throw error;
  }
}
