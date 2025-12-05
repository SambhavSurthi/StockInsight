import { useState, useEffect } from 'react';

const PREFERENCE_KEY = 'dataViewType';
const DEFAULT_PREFERENCE = 'left-to-right'; // newest first (Dec 04, Dec 03, Dec 02, Dec 01)

export const useDataViewPreference = () => {
  const [preference, setPreference] = useState(() => {
    try {
      const stored = localStorage.getItem(PREFERENCE_KEY);
      return stored || DEFAULT_PREFERENCE;
    } catch {
      return DEFAULT_PREFERENCE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCE_KEY, preference);
    } catch {
      // Silent fail if storage is unavailable
    }
  }, [preference]);

  const updatePreference = (newPreference) => {
    if (newPreference === 'left-to-right' || newPreference === 'right-to-left') {
      setPreference(newPreference);
    }
  };

  return [preference, updatePreference];
};

// Helper function to sort data based on preference
export const sortDataByPreference = (data, preference) => {
  if (!data || !Array.isArray(data)) return data;
  
  // Data should already be sorted by date (newest first from API)
  // If right-to-left (oldest first), reverse it
  if (preference === 'right-to-left') {
    return [...data].reverse();
  }
  
  // If left-to-right (newest first), keep as is
  return data;
};

// Helper function to sort date array based on preference
export const sortDatesByPreference = (dates, dateMap, preference) => {
  if (!dates || !Array.isArray(dates)) return dates;
  
  const sorted = [...dates].sort((a, b) => {
    const dateA = new Date(dateMap.get(a));
    const dateB = new Date(dateMap.get(b));
    return dateB - dateA; // Newest first
  });
  
  // If right-to-left (oldest first), reverse it
  if (preference === 'right-to-left') {
    return sorted.reverse();
  }
  
  // If left-to-right (newest first), keep as is
  return sorted;
};

