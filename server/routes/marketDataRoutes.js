const express = require("express");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Proxy to Screener search API
router.get("/search", auth, async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ message: "Query q is required" });
  }

  try {
    const url = `https://www.screener.in/api/company/search/?q=${encodeURIComponent(
      q
    )}&v=3&fts=1`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to search companies" });
  }
});

const CompanyCache = require("../models/CompanyCache");

// Proxy to Screener chart API with Caching
router.get("/company/:id/chart", auth, async (req, res) => {
  const { id } = req.params;
  const forceRefresh = req.query.force === 'true';
  let days = parseInt(req.query.days) || 15;
  
  // Ensure minimum days is 7
  if (days < 7) days = 7;
  // Cap maximum days
  if (days > 365) days = 365;

  try {
    const numericId = parseInt(id);
    
    // 1. Calculate the "freshness cutoff" (4 PM Rule)
    // If now > 4 PM today, data must be from after 4 PM today.
    // If now < 4 PM today, data must be from after 4 PM yesterday.
    const now = new Date();
    // Convert current time to IST (UTC+5:30) for accurate market time check, or just use server local time if server is in IST.
    // Assuming server time is reasonably close or user accepts server time.
    // For safer logic, we can just use the server's local date.
    
    const marketCloseHour = 16; // 4 PM
    
    let lastMarketClose = new Date();
    lastMarketClose.setHours(marketCloseHour, 0, 0, 0); // Today 4 PM
    
    if (now < lastMarketClose) {
      // If currently before 4 PM, the relevant close was Yesterday 4 PM
      lastMarketClose.setDate(lastMarketClose.getDate() - 1);
    }
    
    // 2. Check Cache
    if (!forceRefresh) {
      const cached = await CompanyCache.findOne({ screenerId: numericId });
      
      if (cached) {
        // Check if cached data is fresh enough (fetched AFTER the last market close)
        if (cached.lastFetched > lastMarketClose) {
          // console.log(`Serving cached data for ${id}`);
          return res.json(cached.data);
        }
      }
    }

    // 3. Fetch Fresh Data (if no cache, stale cache, or force refresh)
    // console.log(`Fetching fresh data for ${id}`);
    const url = `https://www.screener.in/api/company/${id}/chart/?q=Price-DMA50-DMA200-Volume&days=${encodeURIComponent(
      days
    )}&consolidated=true`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        // If fetch fails but we have STALE cache, maybe returning stale is better than error?
        // For now, let's stick to error to alert user, or we could fallback.
        return res.status(response.status).json({ 
            message: `Failed to fetch chart data: ${response.statusText}` 
        });
    }
    
    const data = await response.json();
    
    // 4. Save/Update Cache (Upsert)
    // This overwrites the old entry completely, ensuring no storage growth.
    await CompanyCache.findOneAndUpdate(
      { screenerId: numericId },
      { 
        data: data, 
        lastFetched: new Date() 
      },
      { upsert: true, new: true }
    );
    
    res.json(data);

  } catch (err) {
    console.error('Chart API/Cache error:', err);
    res.status(500).json({ message: "Failed to fetch chart data" });
  }
});

module.exports = router;


