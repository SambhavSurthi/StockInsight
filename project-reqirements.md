# StockInsight — Project Requirements & Flow

## 1. Project Summary

**Name:** StockInsight
**One-liner:** Mobile-first personal stock screener and portfolio manager that automates daily price tracking, comparisons, alerts and CSV exports for user holdings.

---

## 2. Goals & Success Metrics

* Automate daily tracking of users' holdings and reduce manual entry time by >90%.
* Deliver an intuitive mobile-first UI for adding/managing holdings, categories and alerts.
* Enable quick comparisons (2–4 stocks), charting, CSV export and basic analytics.
* Target: 1,000 active users in first 6 months; average daily active users (DAU) retention ≥30%.

---

## 3. Personas

* **Retail Investor (Primary):** 30–55yo, holds 20–200 stocks across many companies, reviews prices daily on mobile.
* **Trader/Scanner (Secondary):** Frequent watcher; uses comparison tool and price alerts.
* **Casual Browser (Tertiary):** Interested in future buys; uses "Future Analysis" list.

---

## 4. Scope & MVP (Minimum Viable Product)

**MVP features:**

1. User authentication (email + password, optional OAuth later)
2. Add/remove holdings via search (integrate Screener.in search API)
3. Fetch daily price history for holdings using Screener.in chart API
4. Portfolio view: table + chart; ability to choose date range
5. Add companies to “Future Analysis” list
6. Categories: create/edit/delete categories and assign companies
7. CSV export of tabular data
8. Comparison chart for 2–4 stocks
9. Mobile-first responsive UI (React Native or React PWA optimized for mobile)

**Post-MVP / v1+ features:**

* Price alerts (notifications & in-app), scheduled background fetch
* Account settings, profile, backup/restore (export/import JSON)
* More analytics: moving averages, performance vs index, heatmaps
* Social / shareable charts

---

## 5. High-level Project Flow (User journeys)

1. **Sign up / Sign in** → lands on Dashboard (portfolio summary)
2. **Search company** → results from Screener.in search API

   * Option A: Add to Portfolio (prompts quantity/avg price optional)
   * Option B: Add to Future Analysis (no quantity required)
3. **View Portfolio** → select company → open detail: table, chart, historical range selector, export CSV
4. **Compare** → select 2–4 symbols → render combined chart
5. **Manage Categories** → create/edit/delete categories → assign/unassign stocks
6. **Set Price Alert** (for items in Future Analysis) → save target & notification preference
7. **Remove / Edit Holding** → update quantity, cost basis, or delete

---

## 6. Functional Requirements

### 6.1 Authentication & Authorization

* Secure signup/login (JWT-based sessions)
* Password reset via email
* Roles: user (single role for MVP)

### 6.2 Portfolio Management

* Add holdings with optional quantity and buy price
* CRUD on holdings and categories
* Persist user-specific data in DB (MongoDB)

### 6.3 Data Fetching & APIs

* Use Screener.in search endpoint for symbol/company lookup: `https://www.screener.in/api/company/search/?q={q}&v=3&fts=1`
* Use Screener.in chart endpoint for historical prices: `https://www.screener.in/api/company/{id}/chart/?q=Price-DMA50-DMA200-Volume&days={n}&consolidated=true`
* Data fetch strategy:

  * On-demand fetch when user views company detail (first load)
  * Cache recent fetches (per company) server-side for short TTL (e.g., 1 hour) to reduce repeated calls
  * Scheduled daily sync job (optional) to pull end-of-day prices for all users’ portfolios (scale later)

### 6.4 UI / UX

* Mobile-first single-page app
* Table view with sortable columns (name, current price, day change, % change, quantity, value)
* Chart view supporting multiple series overlay for comparison
* CSV export of currently filtered table

### 6.5 Notifications & Alerts (Post-MVP)

* Allow user to set price thresholds for items in Future Analysis
* Push notifications / in-app alerts when threshold crossed

---

## 7. Non-functional Requirements

* **Performance:** API responses under 500ms for cached queries; UI interactions <100ms perceived latency
* **Scalability:** Horizontal scaling for API server and background workers
* **Availability:** 99.5% uptime target for core APIs
* **Security:** HTTPS only, store passwords hashed (bcrypt), sanitize all inputs
* **Privacy:** Do not share user portfolios publicly; provide export/delete options

---

## 8. Tech Stack

* **Frontend:** React (mobile-first), Tailwind CSS. Consider React Native or React PWA depending on time.
* **Backend:** Node.js + Express (MERN stack)
* **Database:** MongoDB (user, portfolio, alerts, categories, cache)
* **Auth:** JWT, bcrypt for password hashing
* **Task queue / Cron:** Bull (Redis) or node-cron for scheduled syncs & alerts
* **Hosting:** Vercel/Netlify (frontend), DigitalOcean/AWS/GCP for backend
* **Monitoring/Logging:** Sentry, Prometheus / Grafana, ELK or similar

---

## 9. Data Model (Concise)

* **User**: { _id, name, email, passwordHash, createdAt }
* **Holding**: { _id, userId, screenerId, ticker, name, quantity, avgBuyPrice, categoryId, notes, addedAt }
* **FutureAnalysisItem**: { _id, userId, screenerId, ticker, name, note, alertIds[] }
* **Category**: { _id, userId, title, color?, createdAt }
* **PriceCache**: { screenerId, lastFetchedAt, days, data: [{date, open, high, low, close, volume}] }
* **Alert**: { _id, userId, screenerId, type: priceAbove|priceBelow, targetPrice, active, createdAt }

---

## 10. API Contracts (examples)

* `POST /api/auth/signup` {email, password, name} -> 201, { token }
* `GET /api/search?q=` -> proxy to Screener.in search, return list of companies
* `GET /api/company/:id/chart?days=` -> proxy to Screener.in chart
* `POST /api/holdings` -> add user holding
* `GET /api/portfolio` -> user holdings with last price (merged with PriceCache)
* `POST /api/alerts` -> create alert

---

## 11. UI Screens & Flow (Mobile-first)

1. **Auth screens:** Sign up / Sign in / Forgot password
2. **Dashboard:** Portfolio summary (total value, daily P&L)
3. **Search:** Autocomplete search powered by Screener API with Add to Portfolio / Future Analysis buttons
4. **Portfolio list:** Table rows collapsed by default; tap to expand detail
5. **Company Detail:** chart, table of recent N days, technical indicators (DMA50/200) overlay
6. **Compare screen:** select multi-select list and render combined chart
7. **Categories screen:** manage categories and assign stocks
8. **Alerts screen:** list & create alerts
9. **Settings:** account, export/import, privacy

---

## 12. Acceptance Criteria (MVP)

* Users can sign up and sign in.
* Users can search and add a company to Portfolio and Future Analysis.
* The system fetches and displays price data for companies (last N days) using Screener.in endpoints.
* Users can view portfolio as table and chart and export CSV for selected date range.
* Users can create/manage categories and assign holdings.
* Comparison chart for 2–4 stocks works.

---

## 13. Implementation Roadmap & Milestones (suggested)

**Sprint 0 (1 week):** Project setup, repo, CI, basic auth, skeleton frontend
**Sprint 1 (2 weeks):** Search integration, add-to-portfolio flow, data model
**Sprint 2 (2 weeks):** Company detail (chart), PriceCache, CSV export
**Sprint 3 (2 weeks):** Portfolio view, categories, compare tool
**Sprint 4 (2 weeks):** Mobile polish, responsiveness, UX improvements
**Sprint 5 (2 weeks):** Alerts (basic) + testing + deployment

---

## 14. Testing Strategy

* Unit tests: Jest for backend, React Testing Library for frontend
* Integration tests: API endpoints & DB integration
* End-to-end: Cypress or Playwright for main flows
* QA checklist: data correctness with Screener.in responses, caching correctness, CSV export verification

---

## 15. Security & Legal Considerations

* Comply with Screener.in terms of service for API usage
* Rate-limit proxying to avoid IP bans
* Provide privacy policy & terms (if launching publicly)
* Allow users to delete their data (GDPR-style right-to-be-forgotten)

---

## 16. DevOps & Deployment

* CI pipeline: run tests, lint, build
* Staging environment for QA
* Production: autoscale backend, managed MongoDB atlas, Redis for queues
* Backups: nightly DB backups

---

## 17. Monitoring & Observability

* Track errors, latency, API failure rates (Screener API failures)
* Metrics: DAU, retention, number of alerts set, API call counts

---

## 18. Future Enhancements

* Support for additional data sources / broker APIs
* Real-time websockets for intra-day data (if data source allows)
* Portfolio analytics: CAGR, IRR, tax lot accounting
* Social features & sharing

---

## 19. Open Questions / Risks

* Screener.in API rate limits and allowed usage (verify TOS)
* Long-term cost for scheduled syncs if many users
* Decision: React Native app or PWA-first approach

---

## 20. Next Steps (Actionable)

1. Validate Screener.in API rate limits & TOS.
2. Decide mobile approach: React Native vs PWA.
3. Set up repo with template (MERN + Tailwind) and CI.
4. Implement core models and search + add flow (Sprint 1 goal).

---

*Document prepared for StockInsight — use this as the working spec. Update categories, data model or sprint estimates as team size and priorities change.*
