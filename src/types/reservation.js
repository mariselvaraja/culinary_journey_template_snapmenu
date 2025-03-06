export const TableShape = {
  id: '',
  number: 0,
  capacity: 0,
  is_active: false,
  created_at: '',
  updated_at: ''
};

export const ReservationShape = {
  id: '',
  table_id: '',
  customer_name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  party_size: 0,
  status: '', // 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes: '',
  created_at: '',
  updated_at: ''
};

export const ReservationStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};