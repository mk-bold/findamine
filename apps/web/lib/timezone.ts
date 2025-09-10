/**
 * Utility functions for handling timezone conversions
 * All datetimes are stored in UTC in the database
 * These functions help convert between UTC and local time for display
 */

/**
 * Convert a UTC datetime string to local datetime string for input fields
 * @param utcDateTimeString - UTC datetime string from database
 * @returns Local datetime string in format "YYYY-MM-DDTHH:mm"
 */
export function utcToLocalDateTimeString(utcDateTimeString: string | null | undefined): string {
  if (!utcDateTimeString) return '';
  
  const utcDate = new Date(utcDateTimeString);
  const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
  
  return localDate.toISOString().slice(0, 16);
}

/**
 * Convert a local datetime string to UTC datetime string for database storage
 * @param localDateTimeString - Local datetime string from input field
 * @returns UTC datetime string
 */
export function localToUtcDateTimeString(localDateTimeString: string): string {
  if (!localDateTimeString) return '';
  
  const localDate = new Date(localDateTimeString);
  return localDate.toISOString();
}

/**
 * Format a UTC datetime string for display in local time
 * @param utcDateTimeString - UTC datetime string from database
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted local datetime string
 */
export function formatUtcToLocal(
  utcDateTimeString: string | null | undefined, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }
): string {
  if (!utcDateTimeString) return '';
  
  const utcDate = new Date(utcDateTimeString);
  return utcDate.toLocaleString(undefined, options);
}

/**
 * Get current local datetime string for input fields
 * @returns Current local datetime string in format "YYYY-MM-DDTHH:mm"
 */
export function getCurrentLocalDateTimeString(): string {
  const now = new Date();
  const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
  return localDate.toISOString().slice(0, 16);
}

/**
 * Get current UTC datetime string for database storage
 * @returns Current UTC datetime string
 */
export function getCurrentUtcDateTimeString(): string {
  return new Date().toISOString();
}
