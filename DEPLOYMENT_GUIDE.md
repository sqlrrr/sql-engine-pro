# SQL ENGINE PRO - Complete Deployment & Setup Guide

## Project Overview

**SQL ENGINE PRO** is an advanced crypto intelligence system with AI-powered trading signals. The project consists of two repositories:

1. **Frontend** (Public): `sql-engine-pro` - React-based dashboard with mobile-responsive UI
2. **Backend** (Private): `sql-engine-backend` - Node.js Express API with AI signal generation

---

## Frontend Repository: sql-engine-pro

### Tech Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7.1
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Radix UI
- **Routing**: Wouter
- **Package Manager**: pnpm 10.4.1
- **Deployment**: GitHub Pages

### Key Features
✅ Mobile-responsive dashboard (no zoom issues)
✅ Text selection control (only data copyable, UI protected)
✅ Real-time crypto price tracking
✅ AI trading signals (RSI, MACD, Whale Activity, Sentiment)
✅ Dark/Light theme support
✅ Responsive charts and analytics

### Build & Deployment

#### Local Development
```bash
cd sql-engine-pro
pnpm install
pnpm run dev
```

#### Production Build
```bash
pnpm run build
```

This generates:
- Frontend: `dist/public/` (HTML, CSS, JS, assets)
- Backend: `dist/index.js` (Node.js server)

#### Deploy to GitHub Pages
```bash
# Build the project
pnpm run build

# Switch to gh-pages branch
git checkout gh-pages

# Copy built files
cp -r dist/public/* .

# Commit and push
git add -A
git commit -m "Deploy: Updated frontend"
git push origin gh-pages
```

**Live Site**: https://sqlrrr.github.io/sql-engine-pro/

---

## Backend Repository: sql-engine-backend

### Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **APIs**: CoinGecko, Binance, OpenAI
- **Language**: JavaScript (ES6 modules)

### Project Structure
```
sql-engine-backend/
├── src/
│   ├── index.js              # Main Express server
│   ├── services/
│   │   └── signalService.js  # AI Signal Engine
│   └── db/
│       └── database.js       # SQLite setup
├── package.json
├── .env.example
└── .gitignore
```

### AI Signal Engine Features

#### 1. Technical Analysis (RSI & MACD)
- Analyzes price momentum and volatility
- Calculates RSI-based overbought/oversold conditions
- Evaluates volume and price position

#### 2. On-Chain Analysis (Whale Activity)
- Tracks whale accumulation/distribution
- Monitors exchange inflows/outflows
- Analyzes active addresses

#### 3. Sentiment Analysis
- Fear & Greed Index integration
- Social sentiment tracking
- Community buzz analysis

#### 4. Signal Generation
- Combines all three analyses with weighted scoring
- Outputs: BUY, SELL, HOLD signals
- Confidence levels: HIGH, MEDIUM, LOW
- Strength indicators: STRONG_BUY, BUY, SELL, STRONG_SELL

### API Endpoints

#### Health Check
```
GET /api/health
```

#### Get Prices
```
GET /api/prices?symbols=bitcoin,ethereum,solana
```

#### Get Trading Signals
```
GET /api/signals?symbol=BTC
```

#### Get All Signals
```
GET /api/signals/all
```

#### Get Whale Alerts
```
GET /api/whales
```

#### Get Sentiment Data
```
GET /api/sentiment
```

#### Get On-Chain Data
```
GET /api/onchain
```

#### Get Dashboard Data
```
GET /api/dashboard
```

### Setup & Deployment

#### Local Development
```bash
cd sql-engine-backend
npm install
npm start
```

Server runs on `http://localhost:3000`

#### Environment Variables
Create `.env` file (copy from `.env.example`):
```
PORT=3001
NODE_ENV=production
COINGECKO_API_KEY=your_key
BINANCE_API_KEY=your_key
OPENAI_API_KEY=your_key
DATABASE_URL=sqlite.db
```

#### Production Deployment
```bash
npm install
npm start
```

**CORS Configuration**: Allows requests from:
- https://sqlrrr.github.io
- http://localhost:3000
- http://localhost:5173

---

## Database Schema (SQLite)

### signals table
```sql
CREATE TABLE IF NOT EXISTS signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  action TEXT NOT NULL,
  score INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Security Best Practices

### Frontend
✅ Text selection disabled on UI elements (only data copyable)
✅ API keys stored in environment variables
✅ CORS properly configured
✅ No sensitive data in localStorage

### Backend
✅ `.env` file in `.gitignore` (never commit secrets)
✅ Database files in `.gitignore`
✅ CORS restricted to known origins
✅ Input validation on all endpoints
✅ Error messages don't expose internal details

---

## Troubleshooting

### GitHub Pages 404 Errors
**Solution**: Ensure `dist/public/` files are correctly copied to `gh-pages` branch
```bash
git checkout gh-pages
cp -r dist/public/* .
git add -A && git commit -m "fix: update files" && git push
```

### Backend API Not Responding
**Solution**: Check if server is running and CORS is configured
```bash
# Check if port 3000 is in use
lsof -i :3000

# Restart backend
npm start
```

### Database Errors
**Solution**: Ensure SQLite file has proper permissions
```bash
chmod 644 sqlite.db
```

---

## Performance Optimization

### Frontend
- Large chunks (>500kB) detected - consider code splitting
- Use dynamic imports for heavy modules
- Lazy load chart components

### Backend
- Cache API responses (CoinGecko, Binance)
- Implement rate limiting
- Use database indexes for frequent queries

---

## Monitoring & Logging

### Frontend
- Check browser console for errors
- Use React DevTools for component debugging

### Backend
- Enable detailed logging in development
- Monitor API response times
- Track database query performance

---

## Future Enhancements

1. **Advanced ML Models**: Implement neural networks for signal prediction
2. **Real-time WebSocket**: Push updates instead of polling
3. **Portfolio Tracking**: User portfolio management
4. **Alert System**: Email/SMS notifications for signals
5. **Backtesting Engine**: Test strategies on historical data
6. **Mobile App**: Native iOS/Android applications

---

## Support & Contact

For issues or questions:
- GitHub Issues: https://github.com/sqlrrr/sql-engine-pro/issues
- Backend Issues: https://github.com/sqlrrr/sql-engine-backend/issues

---

## License

MIT License - See LICENSE file for details

---

**Last Updated**: January 20, 2026
**Version**: 2.0.0
