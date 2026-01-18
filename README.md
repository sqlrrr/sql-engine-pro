# ⚙️ SQL ENGINE PRO - Advanced Crypto Intelligence System

![GitHub Stars](https://img.shields.io/github/stars/sqlrrr/sql-engine-pro?style=flat-square)
![GitHub License](https://img.shields.io/github/license/sqlrrr/sql-engine-pro?style=flat-square)
![Node Version](https://img.shields.io/badge/node-22.13.0-green?style=flat-square)

## 🚀 Overview

**SQL ENGINE PRO** is an advanced cryptocurrency intelligence platform that combines real-time market data, blockchain analysis, AI-powered trading signals, and social media sentiment analysis to help traders make informed decisions.

### 🎯 Key Features

- **⚡ AI Trading Signals**: Weighted analysis (Technical 30%, On-Chain 30%, Sentiment 20%, Macro 20%)
- **🐋 Whale Tracking**: Real-time monitoring of large wallet movements
- **💬 Social Sentiment**: Twitter, Telegram, Discord analysis with NLP
- **⛓️ On-Chain Analysis**: Blockchain metrics, stablecoin flows, exchange data
- **🔥 Solana Deep Dive**: Mempool monitoring, DEX liquidity tracking
- **📊 Professional Dashboard**: Real-time Lightweight Charts with 8 specialized tabs
- **🔐 Security**: Encrypted API key storage, JWT authentication
- **📈 Auto-Trading**: Exchange API integration for automated trading

## 🔌 Integrated APIs (20 Total)

| Category | APIs |
|----------|------|
| **Market Data** | CoinGecko, Binance, Alpha Vantage, CoinMarketCap |
| **Blockchain** | Etherscan, BSCScan, Solscan, Moralis, Messari, Santiment |
| **RPC Providers** | Alchemy, Infura, QuickNode |
| **News & Sentiment** | NewsAPI, CryptoPanic, LunarCrush, Twitter/X |
| **Communication** | Telegram Bot, Discord |
| **AI & Analytics** | Google AI, Firebase |

## 🛠️ Tech Stack

- **Frontend**: React 19 + Tailwind CSS 4 + TypeScript
- **Backend**: Node.js + Express + tRPC 11
- **Database**: MySQL with Drizzle ORM
- **Charts**: Lightweight Charts (TradingView)
- **Authentication**: Manus OAuth + JWT
- **Deployment**: GitHub Pages + Docker

## 📦 Installation

### Prerequisites
- Node.js 22+
- pnpm 10+
- MySQL database
- All 20 API keys (see `.env.example`)

### Setup

```bash
# Clone repository
git clone https://github.com/sqlrrr/sql-engine-pro.git
cd sql-engine-pro

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in your API keys in .env

# Push database schema
pnpm db:push

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🎨 Dashboard Tabs

1. **Dashboard** - Real-time price charts and market overview
2. **Signals** - AI-generated BUY/SELL/HOLD recommendations
3. **Whales** - Large wallet movements and alerts
4. **Sentiment** - Social media sentiment analysis
5. **On-Chain** - Blockchain metrics and flows
6. **Solana** - Solana-specific deep analysis
7. **Trading** - Auto-trading interface
8. **Settings** - User preferences and risk parameters

## 📊 Signal Generation Logic

### Weightage Formula
```
Final Score = (Technical × 0.30) + (On-Chain × 0.30) + (Sentiment × 0.20) + (Macro × 0.20)

Technical (30%):
  - RSI (30% of technical)
  - MACD (25% of technical)
  - Volume (25% of technical)
  - Order Book (20% of technical)

On-Chain (30%):
  - Whale Activity (40% of on-chain)
  - Stablecoin Flow (35% of on-chain)
  - Exchange Flow (25% of on-chain)

Sentiment (20%):
  - Twitter Sentiment (50% of sentiment)
  - News Sentiment (30% of sentiment)
  - Fear & Greed Index (20% of sentiment)

Macro (20%):
  - DXY (Dollar Index) (40% of macro)
  - Stock Market (35% of macro)
  - Token Unlocks (25% of macro)
```

### Signal Thresholds
- **BUY**: Score ≥ 75 (High Confidence) or ≥ 60 (Medium Confidence)
- **HOLD**: 40 ≤ Score < 60
- **SELL**: Score < 40 (Medium Confidence) or < 25 (High Confidence)

## 🛡️ Fake Signal Detection

The system includes advanced protection against market manipulation:

- **Spoofing Detection**: Identifies fake order walls that disappear quickly
- **Volume Divergence**: Detects fake pumps (price up, volume down)
- **Project Legitimacy**: Verifies GitHub activity and community engagement
- **Historical Analysis**: Compares current patterns with historical data

## 🔐 Security Features

- ✅ All API keys stored as environment variables
- ✅ Encrypted exchange API credentials in database
- ✅ JWT-based authentication
- ✅ Role-based access control (User/Admin)
- ✅ No credentials in source code
- ✅ HTTPS-only communication

## 📈 Database Schema

```
users
├── id (PK)
├── openId (unique)
├── name, email
├── role (user/admin)
└── timestamps

market_data
├── symbol, price, volume
├── bid/ask, change24h
└── marketCap

trading_signals
├── symbol, action (BUY/SELL/HOLD)
├── confidence, score
├── technicalScore, onChainScore, sentimentScore, macroScore
└── reasoning

whale_alerts
├── walletAddress, tokenAddress
├── amount, usdValue
├── alertType (LARGE_BUY/SELL/INFLOW/OUTFLOW)
└── blockchain

social_sentiment
├── symbol, source (TWITTER/TELEGRAM/DISCORD)
├── sentimentScore, bullishCount, bearishCount
└── volume

exchange_api_keys
├── userId, exchange
├── apiKey, secretKey (encrypted)
└── isActive

user_preferences
├── userId, riskProfile
├── autoTradingEnabled, maxLeverage
├── watchlistSymbols
└── notificationsEnabled

trade_history
├── userId, symbol, side (BUY/SELL)
├── quantity, price, totalValue
├── leverage, stopLoss, takeProfit
├── status, pnl
└── timestamps

on_chain_data
├── symbol, blockchain
├── exchangeInflow/Outflow
├── whaleMovements
├── stablecoinInflow/Outflow
└── activeAddresses

news_events
├── symbol, title, description
├── source, sentiment
├── importance, url
└── timestamp
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/api-validation.test.ts

# Watch mode
pnpm test --watch
```

## 🚀 Deployment

### GitHub Pages
The project includes GitHub Actions workflow for automatic deployment:

```bash
# Push to main branch to trigger deployment
git push origin main
```

### Docker
```bash
# Build Docker image
docker build -t sql-engine-pro .

# Run container
docker run -p 3000:3000 sql-engine-pro
```

### Environment Variables
See `.env.example` for all required variables. Key ones:
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session signing key
- All 20 API keys (COINGECKO_API_KEY, BINANCE_API_KEY, etc.)

## 📊 API Endpoints

### Public Endpoints
- `GET /api/trpc/market.prices` - Get current prices
- `GET /api/trpc/market.signals` - Get trading signals
- `GET /api/trpc/market.whales` - Get whale alerts

### Protected Endpoints (Requires Auth)
- `POST /api/trpc/trading.createOrder` - Place trade
- `GET /api/trpc/user.preferences` - Get user settings
- `POST /api/trpc/exchange.connect` - Connect exchange API

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

**This software is provided for educational and informational purposes only.** 

- Always do your own research (DYOR) before trading
- Past performance does not guarantee future results
- Crypto trading involves significant risk of loss
- The signals generated are not financial advice
- Use at your own risk and never invest more than you can afford to lose

## 🔗 Links

- **GitHub**: https://github.com/sqlrrr/sql-engine-pro
- **Live Demo**: https://sql-engine.pro
- **Documentation**: https://github.com/sqlrrr/sql-engine-pro/wiki

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review API integration guides

---

**Made with ❤️ by SQL ENGINE Team**

*Advanced Crypto Intelligence for Professional Traders*
