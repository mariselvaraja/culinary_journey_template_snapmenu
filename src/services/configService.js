import { authClient, publicClient } from '../lib/supabase';

/**
 * Load reservation configuration from the database (public access)
 */
export async function loadReservationConfig() {
  try {
    console.log('Loading reservation configuration...');
    
    const { data, error } = await publicClient
      .from('configurations')
      .select('value')
      .eq('key', 'reservation')
      .single();

    if (error) {
      console.error('Error loading reservation configuration:', error);
      throw error;
    }

    if (!data) {
      console.error('No configuration data found');
      // Insert default configuration
      const defaultConfig = {
        timeSlotInterval: 30,
        maxPartySize: 12,
        minPartySize: 1,
        maxAdvanceDays: 30,
        minNoticeHours: 2,
        reservationHoldTime: 15,
        allowSameDay: true,
        requirePhone: true,
        requireEmail: true,
        maxSpecialRequestLength: 500,
        operatingHours: {
          monday: {
            isOpen: true,
            shifts: [
              { open: '11:30', close: '14:30' },
              { open: '17:00', close: '22:00' }
            ]
          },
          tuesday: {
            isOpen: true,
            shifts: [
              { open: '11:30', close: '14:30' },
              { open: '17:00', close: '22:00' }
            ]
          },
          wednesday: {
            isOpen: true,
            shifts: [
              { open: '11:30', close: '14:30' },
              { open: '17:00', close: '22:00' }
            ]
          },
          thursday: {
            isOpen: true,
            shifts: [
              { open: '11:30', close: '14:30' },
              { open: '17:00', close: '22:00' }
            ]
          },
          friday: {
            isOpen: true,
            shifts: [
              { open: '11:30', close: '14:30' },
              { open: '17:00', close: '23:00' }
            ]
          },
          saturday: {
            isOpen: true,
            shifts: [
              { open: '11:30', close: '14:30' },
              { open: '17:00', close: '23:00' }
            ]
          },
          sunday: {
            isOpen: true,
            shifts: [
              { open: '11:30', close: '14:30' },
              { open: '17:00', close: '22:00' }
            ]
          }
        },
        holidays: []
      };

      console.log('Inserting default configuration:', defaultConfig);
      const { data: insertedData, error: insertError } = await publicClient
        .from('configurations')
        .insert([
          {
            key: 'reservation',
            value: defaultConfig
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting default configuration:', insertError);
        // If insert fails, return default config anyway
        console.log('Returning default configuration');
        return defaultConfig;
      }

      console.log('Default configuration inserted:', insertedData);
      return insertedData.value;
    }

    console.log('Loaded reservation configuration:', data.value);
    return data.value;
  } catch (error) {
    console.error('Error loading reservation configuration:', error);
    // Return default config on error
    const defaultConfig = {
      timeSlotInterval: 30,
      maxPartySize: 12,
      minPartySize: 1,
      maxAdvanceDays: 30,
      minNoticeHours: 2,
      reservationHoldTime: 15,
      allowSameDay: true,
      requirePhone: true,
      requireEmail: true,
      maxSpecialRequestLength: 500,
      operatingHours: {
        monday: {
          isOpen: true,
          shifts: [
            { open: '11:30', close: '14:30' },
            { open: '17:00', close: '22:00' }
          ]
        },
        tuesday: {
          isOpen: true,
          shifts: [
            { open: '11:30', close: '14:30' },
            { open: '17:00', close: '22:00' }
          ]
        },
        wednesday: {
          isOpen: true,
          shifts: [
            { open: '11:30', close: '14:30' },
            { open: '17:00', close: '22:00' }
          ]
        },
        thursday: {
          isOpen: true,
          shifts: [
            { open: '11:30', close: '14:30' },
            { open: '17:00', close: '22:00' }
          ]
        },
        friday: {
          isOpen: true,
          shifts: [
            { open: '11:30', close: '14:30' },
            { open: '17:00', close: '23:00' }
          ]
        },
        saturday: {
          isOpen: true,
          shifts: [
            { open: '11:30', close: '14:30' },
            { open: '17:00', close: '23:00' }
          ]
        },
        sunday: {
          isOpen: true,
          shifts: [
            { open: '11:30', close: '14:30' },
            { open: '17:00', close: '22:00' }
          ]
        }
      },
      holidays: []
    };
    console.log('Returning default configuration');
    return defaultConfig;
  }
}

/**
 * Update reservation configuration (requires authentication)
 */
export async function updateReservationConfig(config) {
  try {
    console.log('Updating reservation configuration:', config);
    
    const { data, error } = await authClient
      .from('configurations')
      .upsert({
        key: 'reservation',
        value: config,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating reservation configuration:', error);
      throw error;
    }

    if (!data) {
      console.error('No configuration data returned after update');
      throw new Error('No configuration data returned after update');
    }

    console.log('Updated reservation configuration:', data.value);
    return data.value;
  } catch (error) {
    console.error('Error updating reservation configuration:', error);
    throw error;
  }
}

/**
 * Load all configurations (requires authentication)
 */
export async function loadAllConfigs() {
  try {
    console.log('Loading all configurations...');
    
    const { data, error } = await authClient
      .from('configurations')
      .select('*')
      .order('key');

    if (error) {
      console.error('Error loading configurations:', error);
      throw error;
    }

    console.log('Loaded configurations:', data);
    return data.map(item => ({
      key: item.key,
      value: item.value
    }));
  } catch (error) {
    console.error('Error loading configurations:', error);
    throw error;
  }
}

/**
 * Load a specific configuration by key (requires authentication)
 */
export async function loadConfig(key) {
  try {
    console.log('Loading configuration for key:', key);
    
    const { data, error } = await authClient
      .from('configurations')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      console.error(`Error loading configuration for key ${key}:`, error);
      throw error;
    }

    if (!data) {
      console.error(`No configuration found for key ${key}`);
      throw new Error(`No configuration found for key ${key}`);
    }

    console.log('Loaded configuration:', data.value);
    return data.value;
  } catch (error) {
    console.error(`Error loading configuration for key ${key}:`, error);
    throw error;
  }
}

/**
 * Update a configuration (requires authentication)
 */
export async function updateConfig(key, value) {
  try {
    console.log('Updating configuration:', { key, value });
    
    const { data, error } = await authClient
      .from('configurations')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error(`Error updating configuration for key ${key}:`, error);
      throw error;
    }

    if (!data) {
      console.error('No configuration data returned after update');
      throw new Error('No configuration data returned after update');
    }

    console.log('Updated configuration:', data.value);
    return data.value;
  } catch (error) {
    console.error(`Error updating configuration for key ${key}:`, error);
    throw error;
  }
}

/**
 * Delete a configuration (requires authentication)
 */
export async function deleteConfig(key) {
  try {
    console.log('Deleting configuration for key:', key);
    
    const { error } = await authClient
      .from('configurations')
      .delete()
      .eq('key', key);

    if (error) {
      console.error(`Error deleting configuration for key ${key}:`, error);
      throw error;
    }

    console.log('Deleted configuration for key:', key);
  } catch (error) {
    console.error(`Error deleting configuration for key ${key}:`, error);
    throw error;
  }
}

// Export all functions
export default {
  loadReservationConfig,
  updateReservationConfig,
  loadAllConfigs,
  loadConfig,
  updateConfig,
  deleteConfig
};
