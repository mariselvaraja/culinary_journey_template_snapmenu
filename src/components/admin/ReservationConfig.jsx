import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Users, Save, X, Plus, Trash, Settings } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { loadReservationConfig, updateReservationConfig } from '@/services/configService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/contexts/AuthContext';

export function ReservationConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();
  const [newHoliday, setNewHoliday] = useState({
    date: '',
    name: '',
    isOpen: false,
    shifts: []
  });

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadConfigData();
  }, [session, navigate]);

  async function loadConfigData() {
    if (!session) return;

    setLoading(true);
    try {
      const data = await loadReservationConfig();
      console.log('Loaded config:', data);
      
      // Ensure we have a valid configuration
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid configuration data received');
      }

      // Ensure required fields exist
      const requiredFields = [
        'timeSlotInterval',
        'maxPartySize',
        'minPartySize',
        'operatingHours',
        'holidays'
      ];

      for (const field of requiredFields) {
        if (!(field in data)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Ensure operatingHours has all days
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const day of days) {
        if (!(day in data.operatingHours)) {
          throw new Error(`Missing operating hours for ${day}`);
        }
      }

      setConfig(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load configuration:', err);
      setError(err.message || 'Failed to load configuration');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!session) {
      setError('You must be logged in to update configuration');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedConfig = await updateReservationConfig(config);
      console.log('Saved config:', updatedConfig);
      setConfig(updatedConfig);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update configuration:', err);
      setError('Failed to update configuration');
    } finally {
      setLoading(false);
    }
  }

  function addShift(day) {
    const dayConfig = config.operatingHours[day];
    const newShifts = [...dayConfig.shifts, { open: '09:00', close: '17:00' }];
    setConfig({
      ...config,
      operatingHours: {
        ...config.operatingHours,
        [day]: {
          ...dayConfig,
          shifts: newShifts
        }
      }
    });
  }

  function removeShift(day, index) {
    const dayConfig = config.operatingHours[day];
    const newShifts = dayConfig.shifts.filter((_, i) => i !== index);
    setConfig({
      ...config,
      operatingHours: {
        ...config.operatingHours,
        [day]: {
          ...dayConfig,
          shifts: newShifts
        }
      }
    });
  }

  function updateShift(day, index, field, value) {
    const dayConfig = config.operatingHours[day];
    const newShifts = dayConfig.shifts.map((shift, i) => 
      i === index ? { ...shift, [field]: value } : shift
    );
    setConfig({
      ...config,
      operatingHours: {
        ...config.operatingHours,
        [day]: {
          ...dayConfig,
          shifts: newShifts
        }
      }
    });
  }

  function addHoliday() {
    if (!newHoliday.date || !newHoliday.name) return;
    setConfig({
      ...config,
      holidays: [...(config.holidays || []), newHoliday]
    });
    setNewHoliday({
      date: '',
      name: '',
      isOpen: false,
      shifts: []
    });
  }

  function removeHoliday(index) {
    setConfig({
      ...config,
      holidays: config.holidays.filter((_, i) => i !== index)
    });
  }

  if (!session) {
    return null;
  }

  if (loading && !config) {
    return <LoadingSpinner />;
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error || 'Failed to load configuration'}
        </div>
      </div>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="min-h-screen bg-neutral-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-8 bg-orange-500 rounded"></div>
          <h1 className="text-3xl font-serif text-orange-600">Reservation Settings</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <X className="h-5 w-5 mr-2" />
            {error}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-800 hover:text-red-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-lg flex items-center">
          <Save className="h-5 w-5 mr-2" />
          Settings saved successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Operating Hours */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center space-x-2 p-6 border-b border-gray-200">
            <div className="w-1 h-8 bg-blue-500 rounded"></div>
            <h2 className="text-xl font-semibold text-blue-900">Operating Hours</h2>
          </div>
          
          <div className="p-6 space-y-8">
            {days.map(day => {
              const dayConfig = config.operatingHours[day] || { isOpen: false, shifts: [] };
              return (
                <div key={day} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium capitalize">{day}</h3>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={dayConfig.isOpen}
                          onChange={(e) => setConfig({
                            ...config,
                            operatingHours: {
                              ...config.operatingHours,
                              [day]: {
                                ...dayConfig,
                                isOpen: e.target.checked
                              }
                            }
                          })}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">Open</span>
                      </label>
                      {dayConfig.isOpen && (
                        <button
                          type="button"
                          onClick={() => addShift(day)}
                          className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Shift
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {dayConfig.isOpen && dayConfig.shifts.map((shift, index) => (
                    <div key={index} className="flex items-center space-x-4 ml-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <input
                          type="time"
                          value={shift.open}
                          onChange={(e) => updateShift(day, index, 'open', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={shift.close}
                          onChange={(e) => updateShift(day, index, 'close', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      {dayConfig.shifts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeShift(day, index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Holidays */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center space-x-2 p-6 border-b border-gray-200">
            <div className="w-1 h-8 bg-red-500 rounded"></div>
            <h2 className="text-xl font-semibold text-red-900">Holidays & Special Dates</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Add New Holiday */}
            <div className="flex items-end space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <button
                type="button"
                onClick={addHoliday}
                className="flex items-center px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Holiday
              </button>
            </div>

            {/* Holiday List */}
            <div className="space-y-4">
              {(config.holidays || []).map((holiday, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <p className="font-medium">{holiday.name}</p>
                      <p className="text-gray-500">{holiday.date}</p>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={holiday.isOpen}
                        onChange={(e) => {
                          const newHolidays = [...config.holidays];
                          newHolidays[index] = {
                            ...holiday,
                            isOpen: e.target.checked
                          };
                          setConfig({ ...config, holidays: newHolidays });
                        }}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Open</span>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeHoliday(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center space-x-2 p-6 border-b border-gray-200">
            <div className="w-1 h-8 bg-purple-500 rounded"></div>
            <h2 className="text-xl font-semibold text-purple-900">General Settings</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot Interval (minutes)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="15"
                    max="60"
                    step="15"
                    value={config.timeSlotInterval}
                    onChange={(e) =>
                      setConfig({ ...config, timeSlotInterval: parseInt(e.target.value) })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hold Time (minutes)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="60"
                    step="5"
                    value={config.reservationHoldTime}
                    onChange={(e) =>
                      setConfig({ ...config, reservationHoldTime: parseInt(e.target.value) })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Notice (hours)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={config.minNoticeHours}
                    onChange={(e) =>
                      setConfig({ ...config, minNoticeHours: parseInt(e.target.value) })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Advance Days
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={config.maxAdvanceDays}
                    onChange={(e) =>
                      setConfig({ ...config, maxAdvanceDays: parseInt(e.target.value) })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Party Size
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={config.minPartySize}
                    onChange={(e) =>
                      setConfig({ ...config, minPartySize: parseInt(e.target.value) })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Party Size
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={config.maxPartySize}
                    onChange={(e) =>
                      setConfig({ ...config, maxPartySize: parseInt(e.target.value) })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.requirePhone}
                    onChange={(e) =>
                      setConfig({ ...config, requirePhone: e.target.checked })
                    }
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Require Phone Number</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.requireEmail}
                    onChange={(e) =>
                      setConfig({ ...config, requireEmail: e.target.checked })
                    }
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Require Email</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.allowSameDay}
                    onChange={(e) =>
                      setConfig({ ...config, allowSameDay: e.target.checked })
                    }
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Allow Same Day Reservations</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            <Settings className="h-5 w-5 mr-2" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
