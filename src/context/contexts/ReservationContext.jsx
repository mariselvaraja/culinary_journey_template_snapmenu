import React, { createContext, useContext, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { publicClient } from '@/lib/supabase';
import { createReservation, getTableAvailability } from '@/services/reservationService';

export const ReservationContext = createContext();

export function useReservation() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
}

export function ReservationProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [config, setConfig] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Load configuration on mount
  React.useEffect(() => {
    let mounted = true;
    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading reservation configuration...');
        
        const { data, error } = await publicClient
          .from('configurations')
          .select('value')
          .eq('key', 'reservation')
          .single();

        if (error) {
          console.error('Error loading configuration:', error);
          throw error;
        }

        if (!data) {
          throw new Error('No configuration data received');
        }
        
        if (mounted) {
          console.log('Setting config:', data.value);
          setConfig(data.value);
          console.log('Configuration loaded successfully');
        }
      } catch (err) {
        console.error('Error loading reservation configuration:', err);
        if (mounted) {
          setError(err.message || 'Error loading configuration');
          setConfig(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadConfig();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchTimeSlots = useCallback(async (date, partySize) => {
    if (!config) {
      console.error('Configuration not loaded');
      throw new Error('Configuration not loaded');
    }

    // Debounce check (1 second)
    const now = Date.now();
    if (now - lastFetchTime < 1000) {
      console.log('Debouncing time slot fetch');
      return;
    }

    // setLoading(true);
    setError(null);
    console.log(`Fetching time slots for date: ${date}, party size: ${partySize}`);
    
    try {
      const { data: slots, error } = await publicClient
        .rpc('get_available_time_slots', {
          p_date: date,
          p_party_size: Number(partySize)
        });

      if (error) {
        console.error('Error fetching time slots:', error);
        throw error;
      }

      if (!slots) {
        throw new Error('No time slots returned from server');
      }

      // Format time slots to ensure consistent structure
      const formattedSlots = slots.map(slot => ({
        time: slot.slot_time, // Map slot_time to time for frontend consistency
        available: slot.available
      }));

      console.log('Time slots fetched:', formattedSlots);
      setTimeSlots(formattedSlots);
      setLastFetchTime(now);
      return formattedSlots;
    } catch (err) {
      console.error('Error in fetchTimeSlots:', err);
      setError(err.message || 'Failed to fetch time slots');
      setTimeSlots([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [config, lastFetchTime]);

  const makeReservation = useCallback(async (reservationData) => {
    setLoading(true);
    setError(null);
    console.log('Making reservation with data:', reservationData);

    try {
      // First check availability
      const availability = await getTableAvailability(
        reservationData.reservation_date,
        reservationData.reservation_time,
        reservationData.party_size
      );

      if (!availability.available) {
        throw new Error(availability.message || 'Selected time slot is no longer available');
      }

      // Create the reservation
      const result = await createReservation({
        ...reservationData,
        status: 'pending'
      });

      if (!result) {
        throw new Error('No result returned from server');
      }

      console.log('Reservation created successfully:', result);
      return result;
    } catch (err) {
      console.error('Error in makeReservation:', err);
      setError(err.message || 'Failed to create reservation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    loading,
    error,
    config,
    timeSlots,
    fetchTimeSlots,
    makeReservation,
    clearError: () => setError(null)
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
}
