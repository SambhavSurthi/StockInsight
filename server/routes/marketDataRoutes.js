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

// Proxy to Screener chart API
router.get("/company/:id/chart", auth, async (req, res) => {
  const { id } = req.params;
  let days = parseInt(req.query.days) || 15;
  
  // Ensure minimum days is 7 (Screener API might have issues with very low values)
  if (days < 7) {
    days = 7;
  }
  // Cap maximum days
  if (days > 365) {
    days = 365;
  }

  try {
    const url = `https://www.screener.in/api/company/${id}/chart/?q=Price-DMA50-DMA200-Volume&days=${encodeURIComponent(
      days
    )}&consolidated=true`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        message: `Failed to fetch chart data: ${response.statusText}` 
      });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Chart API error:', err);
    res.status(500).json({ message: "Failed to fetch chart data" });
  }
});

module.exports = router;


