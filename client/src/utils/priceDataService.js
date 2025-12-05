import { API_ENDPOINTS } from '../config/api';

const CACHE_PREFIX = 'stock_price_cache_';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

// Get cache key
const getCacheKey = (screenerId, days) => `${CACHE_PREFIX}${screenerId}_${days}`;

// Check if cached data is still valid
const isCacheValid = (cachedData) => {
  if (!cachedData || !cachedData.timestamp) return false;
  return Date.now() - cachedData.timestamp < CACHE_DURATION;
};

// Get cached data
export const getCachedPriceData = (screenerId, days) => {
  try {
    const cacheKey = getCacheKey(screenerId, days);
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      if (isCacheValid(data)) {
        // Ensure cached data is sorted (newest first)
        const sorted = [...data.data].sort((a, b) => new Date(b.date) - new Date(a.date));
        return sorted;
      }
    }
  } catch {
    // Silent fail
  }
  return null;
};

// Save data to cache
export const setCachedPriceData = (screenerId, days, data) => {
  try {
    const cacheKey = getCacheKey(screenerId, days);
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch {
    // Silent fail if storage is full
  }
};

// Fetch price data with retry logic
export const fetchPriceDataWithRetry = async (
  screenerId,
  days,
  token,
  maxRetries = 5,
  retryDelay = 2000
) => {
  // Check cache first
  const cached = getCachedPriceData(screenerId, days);
  if (cached) {
    return cached;
  }

  let lastError = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(API_ENDPOINTS.MARKET.COMPANY_CHART(screenerId, days), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 429) {
        // Rate limited - wait longer before retry
        const waitTime = retryDelay * Math.pow(2, attempt) + Math.random() * 1000; // Exponential backoff with jitter
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (res.status === 401) {
        // Don't retry on 401 - it's an auth issue
        throw new Error('Unauthorized');
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const priceDataset = data.datasets?.find((d) => d.metric === 'Price');
      
      if (priceDataset && Array.isArray(priceDataset.values)) {
        const rows = priceDataset.values.map(([date, priceStr]) => {
          const dateObj = new Date(date);
          const dateLabel = dateObj.toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'short',
          });
          const fullDateLabel = dateObj.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          const price = Number(priceStr);
          return {
            date,
            dateLabel,
            fullDateLabel,
            price: isNaN(price) ? null : price,
          };
        });

        // Sort by date (newest first) to ensure consistent ordering
        const sortedRows = rows.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Cache the successful result
        setCachedPriceData(screenerId, days, sortedRows);
        return sortedRows;
      }

      return [];
    } catch (error) {
      lastError = error;
      
      // Don't retry on auth errors
      if (error.message === 'Unauthorized') {
        throw error;
      }
      
      // If it's not a rate limit error, wait a bit before retry
      if (error.message !== 'HTTP 429' && attempt < maxRetries - 1) {
        const waitTime = retryDelay * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // If all retries failed, return empty array
  console.warn(`Failed to fetch data for company ${screenerId} after ${maxRetries} attempts:`, lastError);
  return [];
};

// Fetch multiple companies with sequential requests to avoid rate limiting
export const fetchMultipleCompaniesSequentially = async (
  companies,
  days,
  token,
  onProgress = null
) => {
  const results = {};
  
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    
    try {
      // Check cache first
      const cached = getCachedPriceData(company.screenerId, days);
      if (cached) {
        results[company.screenerId] = cached;
        if (onProgress) {
          onProgress(i + 1, companies.length, company.name, true);
        }
        // Small delay even for cached to avoid overwhelming
        if (i < companies.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        continue;
      }

      // Fetch with retry
      const data = await fetchPriceDataWithRetry(company.screenerId, days, token);
      results[company.screenerId] = data;
      
      if (onProgress) {
        onProgress(i + 1, companies.length, company.name, data.length > 0);
      }

      // Add delay between requests to avoid rate limiting
      // Longer delay for non-cached requests
      if (i < companies.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 800)); // 800ms delay between requests
      }
    } catch (error) {
      // If it's an auth error, throw it up
      if (error.message === 'Unauthorized') {
        throw error;
      }
      // Otherwise, continue with empty data for this company and retry later
      // We'll keep trying until we get data
      results[company.screenerId] = [];
      if (onProgress) {
        onProgress(i + 1, companies.length, company.name, false);
      }
      
      // Wait a bit before continuing to next company
      if (i < companies.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  // Retry failed requests (those with empty arrays)
  const failedCompanies = companies.filter(
    (c) => !results[c.screenerId] || results[c.screenerId].length === 0
  );

  if (failedCompanies.length > 0) {
    // Retry failed companies with longer delays
    for (let i = 0; i < failedCompanies.length; i++) {
      const company = failedCompanies[i];
      
      try {
        const data = await fetchPriceDataWithRetry(
          company.screenerId,
          days,
          token,
          10, // More retries
          3000 // Longer delay
        );
        
        if (data.length > 0) {
          results[company.screenerId] = data;
          if (onProgress) {
            onProgress(
              companies.length - failedCompanies.length + i + 1,
              companies.length,
              company.name,
              true
            );
          }
        }
        
        // Delay between retry attempts
        if (i < failedCompanies.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      } catch (error) {
        // If it's an auth error, throw it up
        if (error.message === 'Unauthorized') {
          throw error;
        }
        // Otherwise, keep empty array
      }
    }
  }

  return results;
};

