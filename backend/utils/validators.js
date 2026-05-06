/**
 * Validation utilities for backend
 */

/**
 * Validate 10-digit mobile number
 * Accepts: 10 consecutive digits, with or without spaces/dashes
 */
function validateMobileNumber(phone) {
  if (!phone) return true; // Phone is optional
  
  // Remove spaces, dashes, and other common separators
  const cleanedValue = phone.toString().replace(/[\s\-()]/g, '');
  
  // Check if it's exactly 10 digits
  return /^\d{10}$/.test(cleanedValue);
}

/**
 * Validate proper email format
 */
function validateEmail(email) {
  if (!email) return false; // Email should be provided

  // RFC 5322 simplified email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate meter number format
 * Accepts: MTR-XXXX or numeric format (4-10 digits)
 */
function validateMeterNumber(meterNumber) {
  if (!meterNumber) return true; // Meter number is optional
  
  const value = meterNumber.toString().toUpperCase().trim();
  
  // Accepts MTR-XXXX format (4 digits) or pure numeric format (4-10 digits)
  const meterRegex = /^(MTR-\d{4}|\d{4,10})$/;
  
  return meterRegex.test(value);
}

/**
 * Validate customer data
 */
function validateCustomer(data) {
  const errors = [];

  // Validate email
  if (!data.email) {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Email must be in valid format (e.g., user@example.com)');
  }

  // Validate phone if provided
  if (data.phone && !validateMobileNumber(data.phone)) {
    errors.push('Phone number must be 10 digits');
  }

  // Validate meter number if provided
  if (data.meterNumber && !validateMeterNumber(data.meterNumber)) {
    errors.push('Meter number must be MTR-XXXX or numeric format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateMobileNumber,
  validateEmail,
  validateMeterNumber,
  validateCustomer
};
