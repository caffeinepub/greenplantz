/**
 * Normalizes unknown error values into a safe English message string.
 * Preserves backend error text when present.
 */
export function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    // Check for common error object patterns
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    // Try to extract meaningful information from the error object
    try {
      const errorString = JSON.stringify(error);
      if (errorString !== '{}') {
        return errorString;
      }
    } catch {
      // JSON.stringify failed, continue to default
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
}
