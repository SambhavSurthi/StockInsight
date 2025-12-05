# 📈 StockInsight

> A modern, mobile-first personal stock screener and portfolio manager that automates daily price tracking, comparisons, and analytics for your investments.

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.0.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

### 🎯 Core Features
- **🔐 User Authentication** - Secure signup/login with JWT-based sessions
- **🔍 Smart Company Search** - Search and add companies instantly using Screener.in integration
- **📊 Portfolio Management** - Track your investments with detailed portfolio views
- **🔮 Future Analysis** - Maintain a watchlist of potential investments
- **📈 Advanced Charts** - Multiple chart types (Line, Bar, Change) with interactive tooltips
- **🔄 Real-time Price Updates** - Automatic price updates with smart caching and retry logic
- **📋 Category System** - Organize companies with custom categories and hierarchical views
- **⚖️ Stock Comparison** - Compare 2-3 companies side-by-side with area and bar charts
- **💾 Save Comparisons** - Save and load comparison sets for quick access
- **📤 CSV Export** - Export portfolio data to CSV format for external analysis

### 🎨 UI/UX Features
- **📱 Mobile-First Design** - Fully responsive design optimized for all devices
- **🌓 Dark/Light Mode** - Toggle between themes with persistent preferences
- **🎨 Categorical Coloring** - Color-code companies by category for easy identification
- **📊 Flexible Data Views** - Choose between Price, Amount, Percentage, or All views
- **🔄 Custom Date Ranges** - View data for 7, 15, 30 days or custom ranges (up to 365 days)
- **📅 Data View Preferences** - Choose left-to-right or right-to-left date ordering
- **🎯 Interactive Tooltips** - Detailed tooltips with full date, price, and change information

### 📊 Dashboard Analytics
- Total companies in portfolio
- Today's profit/loss making companies (with amounts and percentages)
- Most profit-making categories
- Reference date tracking for accurate statistics

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library
- **Framer Motion** - Animation library
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.2.1** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 9.0.0** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📸 Screenshots

> _Add screenshots of your application here_

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SambhavSurthi/StockInsight.git
   cd StockInsight
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the `server` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/stockinsight
   # Or use MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/stockinsight
   
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start the development servers**

   From the root directory:
   ```bash
   npm start
   ```

   Or run separately:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
StockInsight/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── config/         # Configuration files
│   │   ├── utils/          # Utility functions
│   │   └── lib/            # Library files
│   ├── public/             # Static assets
│   └── package.json
│
├── server/                 # Express backend application
│   ├── controllers/        # Route controllers
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── server.js           # Entry point
│   └── package.json
│
├── .gitignore
├── DEPLOYMENT.md           # Deployment guide
├── README.md               # This file
└── package.json            # Root package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Portfolio
- `GET /api/portfolio` - Get user's portfolio
- `POST /api/portfolio` - Add company to portfolio
- `DELETE /api/portfolio/:id` - Remove company from portfolio
- `POST /api/portfolio/bulk-delete` - Bulk delete companies

### Future Analysis
- `GET /api/future-analysis` - Get future analysis list
- `POST /api/future-analysis` - Add company to future analysis
- `DELETE /api/future-analysis/:id` - Remove from future analysis
- `POST /api/future-analysis/move-to-portfolio` - Move to portfolio

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `POST /api/categories/update-company-category` - Update company category

### Comparisons
- `GET /api/comparisons` - Get saved comparisons
- `POST /api/comparisons` - Save comparison
- `GET /api/comparisons/:id` - Get comparison by ID
- `PUT /api/comparisons/:id` - Update comparison
- `DELETE /api/comparisons/:id` - Delete comparison

### Market Data
- `GET /api/market/search?q=query` - Search companies
- `GET /api/market/company/:id/chart?days=n` - Get price chart data

## 🎯 Usage

1. **Sign Up / Login**
   - Create an account or login with existing credentials

2. **Search & Add Companies**
   - Use the search bar to find companies
   - Add to Portfolio or Future Analysis
   - Assign to a category when adding

3. **Manage Portfolio**
   - View all companies in your portfolio
   - Click on a company to see detailed charts and data
   - Use filters and date ranges to customize views
   - Export data to CSV

4. **Compare Stocks**
   - Select 2-3 companies to compare
   - View side-by-side charts
   - Save comparisons for later

5. **Organize with Categories**
   - Create custom categories
   - Assign colors to categories
   - View companies in hierarchical tree structure

6. **Customize Settings**
   - Toggle dark/light mode
   - Set data view preferences (left-to-right or right-to-left)
   - Update profile information

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options

- **Render** - Recommended for easy full-stack deployment
- **Vercel** - Great for frontend deployment
- **Railway** - Good for backend services
- **Netlify** - Alternative for frontend

## 🔒 Security

- Passwords are hashed using bcryptjs
- JWT tokens for secure authentication
- CORS configured for production
- Environment variables for sensitive data
- Input validation and sanitization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**Sambhav Surthi**

- LinkedIn: [sambhavsurthi](https://www.linkedin.com/in/sambhavsurthi/)
- GitHub: [SambhavSurthi](https://github.com/SambhavSurthi)
- Portfolio: [sambhavsurthi.in](https://www.sambhavsurthi.in/)
- Email: 2300031622cseelge@gmail.com

## 🙏 Acknowledgments

- [Screener.in](https://www.screener.in/) - For providing stock market data APIs
- [Recharts](https://recharts.org/) - For charting capabilities
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - For UI component inspiration

## 📊 Project Status

✅ **MVP Complete** - All core features implemented
- User authentication
- Portfolio management
- Future analysis
- Category system
- Stock comparison
- CSV export
- Advanced charts
- Dashboard analytics

🔄 **In Progress** - Continuous improvements
- Performance optimizations
- Additional analytics features
- Mobile app (future)

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact via email: sambhavsurthi14@gmail.com

---

⭐ If you find this project helpful, please consider giving it a star!

