import { useState, useEffect } from 'react';

/**
 * useDebounce
 * Delays updating the returned value until after the specified delay.
 * Used for search input to reduce API calls.
 */
const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
