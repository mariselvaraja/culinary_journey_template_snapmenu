export function formatPhoneNumber(value) {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const truncated = cleaned.slice(0, 10);
  
  // Format as XXX-XXX-XXXX
  if (truncated.length >= 6) {
    return `${truncated.slice(0, 3)}-${truncated.slice(3, 6)}-${truncated.slice(6)}`;
  } else if (truncated.length >= 3) {
    return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
  }
  
  return truncated;
}

export function validatePhoneNumber(phone) {
  // Check if phone number matches XXX-XXX-XXXX format
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(phone);
}
