/**
 * Input validation utilities for forms
 */

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Kenyan phone number: 07XX or +254XX
  const regex = /^(?:254|\+254|0)([71](?:[0-9]){8})$/;
  return regex.test(phone.replace(/\s/g, ''));
};

export const validateProgramForm = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Program name must be at least 2 characters' });
  }
  
  if (!data.description || data.description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
  }
  
  if (!data.category) {
    errors.push({ field: 'category', message: 'Category is required' });
  }
  
  if (data.price === undefined || data.price < 0) {
    errors.push({ field: 'price', message: 'Price must be 0 or greater' });
  }
  
  return errors;
};

export const validateProductForm = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Product name must be at least 2 characters' });
  }
  
  if (!data.description || data.description.trim().length < 5) {
    errors.push({ field: 'description', message: 'Description must be at least 5 characters' });
  }
  
  if (!data.category) {
    errors.push({ field: 'category', message: 'Category is required' });
  }
  
  if (data.price === undefined || data.price <= 0) {
    errors.push({ field: 'price', message: 'Price must be greater than 0' });
  }
  
  if (data.stock === undefined || data.stock < 0) {
    errors.push({ field: 'stock', message: 'Stock cannot be negative' });
  }
  
  if (!data.imageUrl || !isValidUrl(data.imageUrl)) {
    errors.push({ field: 'imageUrl', message: 'Valid image URL is required' });
  }
  
  return errors;
};

export const validateMembershipPlanForm = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Plan name must be at least 2 characters' });
  }
  
  if (!data.targetAge) {
    errors.push({ field: 'targetAge', message: 'Target age is required' });
  }
  
  const rates = data.rates || {};
  if ((rates.hourly === undefined || rates.hourly < 0) && 
      (rates.weekly === undefined || rates.weekly < 0) && 
      (rates.monthly === undefined || rates.monthly < 0)) {
    errors.push({ field: 'rates', message: 'At least one rate must be set' });
  }
  
  return errors;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateMealPlanForm = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (!data.title || data.title.trim().length < 2) {
    errors.push({ field: 'title', message: 'Meal plan title must be at least 2 characters' });
  }
  if (!data.content || data.content.trim().length < 10) {
    errors.push({ field: 'content', message: 'Content must be at least 10 characters' });
  }
  return errors;
};

export const validateSessionForm = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (!data.programId) {
    errors.push({ field: 'programId', message: 'Program is required' });
  }
  if (!data.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  }
  if (!data.time) {
    errors.push({ field: 'time', message: 'Time is required' });
  }
  if (data.capacity === undefined || data.capacity <= 0) {
    errors.push({ field: 'capacity', message: 'Capacity must be greater than 0' });
  }
  return errors;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('254')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    return '+254' + cleaned.slice(1);
  }
  return '+254' + cleaned;
};
