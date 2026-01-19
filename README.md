# ⚙️ SQL ENGINE PRO - Advanced Crypto Intelligence System

![GitHub Stars](https://img.shields.io/github/stars/sqlrrr/sql-engine-pro?style=flat-square)
![GitHub License](https://img.shields.io/github/license/sqlrrr/sql-engine-pro?style=flat-square)
![Node Version](https://img.shields.io/badge/node-22.13.0-green?style=flat-square)

## 🚀 Overview

**SQL ENGINE PRO** is an advanced cryptocurrency intelligence platform that combines real-time market data, blockchain analysis, AI-powered trading signals, and social media sentiment analysis to help traders make informed decisions.

### 🎯 Key Features

- **⚡ AI Trading Signals**: Weighted analysis (Technical 35%, On-Chain 25%, Sentiment 20%, Macro 20%)
- **🐋 Whale Tracking**: Real-time monitoring of large wallet movements
- **💬 Social Sentiment**: Twitter, Telegram, Discord analysis with NLP
- **⛓️ On-Chain Analysis**: Blockchain metrics, stablecoin flows, exchange data
- **🔥 Solana Deep Dive**: Mempool monitoring, DEX liquidity tracking
- **📊 Professional Dashboard**: Real-time Lightweight Charts with 8 specialized tabs
- **🔐 Security**: Encrypted API key storage, JWT authentication
- **📈 Auto-Trading**: Exchange API integration for automated trading

## 🔌 Integrated APIs (20+ Total)

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
- **Database**: SQLite (Optimized) with Drizzle ORM
- **Charts**: Lightweight Charts (TradingView)
- **Authentication**: Manus OAuth + JWT
- **Deployment**: GitHub Pages + Docker

## 📦 Installation

### Prerequisites
- Node.js 22+
- pnpm 10+
- SQLite (included)
- API keys (see `.env.example`)

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
```

## 📊 API Endpoints (Comprehensive List)

The system uses **tRPC** for type-safe API communication. All endpoints are prefixed with `/api/trpc/`.

### 🔐 Authentication & User
1.  `GET /auth.me` - Get current logged-in user profile
2.  `POST /auth.logout` - Securely logout and clear session cookies
3.  `GET /api/oauth/callback` - OAuth provider callback handler

### 📈 Market & Intelligence
4.  `GET /market.prices` - Real-time price data from multiple exchanges
5.  `GET /market.signals` - AI-generated BUY/SELL/HOLD recommendations
6.  `GET /market.whales` - Real-time whale movement alerts
7.  `GET /market.sentiment` - Social media sentiment analysis scores
8.  `GET /market.onchain` - Blockchain metrics (Inflows/Outflows)
9.  `GET /market.solana` - Solana-specific ecosystem analysis
10. `GET /market.news` - Aggregated crypto news feed

### 💼 Trading Operations (Protected)
11. `POST /trading.connectExchange` - Connect API keys for Binance/Bybit/etc.
12. `GET /trading.getBalance` - Fetch real-time account balance from exchange
13. `POST /trading.placeOrder` - Execute manual BUY/SELL orders
14. `GET /trading.getPositions` - View current open trading positions
15. `GET /trading.getTradeHistory` - Fetch historical trade data
16. `GET /trading.getTradingStats` - Calculate Win Rate, PnL, and ROI

### 🤖 Auto-Trading Engine
17. `POST /trading.updateAutoTrading` - Configure AI trading parameters
18. `POST /trading.toggleAutoTrading` - Enable/Disable the autonomous bot
19. `GET /trading.getBotStatus` - Check health and activity of the trading bot

### ⚙️ System & Admin
20. `GET /system.health` - Check server and database connectivity status
21. `POST /system.notifyOwner` - Send emergency alerts to system admin
22. `GET /system.logs` - (Admin) View system execution logs

## 📊 Signal Generation Logic

### Weightage Formula
```
Final Score = (Technical × 0.35) + (On-Chain × 0.25) + (Sentiment × 0.20) + (Macro × 0.20)
```

## 🛡️ Fake Signal Detection
- **Spoofing Detection**: Identifies fake order walls
- **Volume Divergence**: Detects fake pumps (price up, volume down)
- **Project Legitimacy**: Verifies GitHub activity

## ⚠️ Disclaimer
**This software is provided for educational purposes only.** Crypto trading involves significant risk. Use at your own risk.

---
**Made with ❤️ by SQL ENGINE Team**
