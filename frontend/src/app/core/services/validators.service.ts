import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  constructor() { }

  /**
   * Validator for 10-digit mobile number
   * Accepts: 10 consecutive digits, with or without spaces/dashes
   */
  mobileNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Don't validate empty values
      }

      // Remove spaces, dashes, and other common separators
      const cleanedValue = control.value.toString().replace(/[\s\-()]/g, '');

      // Check if it's exactly 10 digits
      if (!/^\d{10}$/.test(cleanedValue)) {
        return { invalidMobileNumber: { value: control.value } };
      }

      return null;
    };
  }

  /**
   * Validator for proper email format
   * Uses comprehensive regex pattern for email validation
   */
  email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Don't validate empty values
      }

      // RFC 5322 simplified email regex pattern
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(control.value)) {
        return { invalidEmail: { value: control.value } };
      }

      return null;
    };
  }

  /**
   * Validator for meter number format
   * Accepts: MTR-XXXX or numeric format
   */
  meterNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Don't validate empty values
      }

      const value = control.value.toString().toUpperCase().trim();

      // Accepts MTR-XXXX format (4 digits) or pure numeric format
      const meterRegex = /^(MTR-\d{4}|\d{4,10})$/;

      if (!meterRegex.test(value)) {
        return { invalidMeterNumber: { value: control.value } };
      }

      return null;
    };
  }
}
