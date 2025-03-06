console.log('timeUtils.js is being loaded');

/**
 * Convert 24-hour time format to 12-hour format
 * @param {string} time - Time in 24-hour format (HH:mm)
 * @returns {string} Time in 12-hour format (h:mm AM/PM)
 */
export function to12Hour(time) {
  console.log('to12Hour called with:', time);
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const result = `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
    console.log('to12Hour result:', result);
    return result;
  } catch (err) {
    console.error('Error in to12Hour:', err);
    return time; // fallback to original format
  }
}

/**
 * Convert 12-hour time format to 24-hour format
 * @param {string} time - Time in 12-hour format (h:mm AM/PM)
 * @returns {string} Time in 24-hour format (HH:mm)
 */
export function to24Hour(time) {
  console.log('to24Hour called with:', time);
  try {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    const result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    console.log('to24Hour result:', result);
    return result;
  } catch (err) {
    console.error('Error in to24Hour:', err);
    return time; // fallback to original format
  }
}
