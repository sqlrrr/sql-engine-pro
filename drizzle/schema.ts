import { int, text, sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(strftime('%s', 'now'))`).notNull(),
  lastSignedIn: integer("lastSignedIn").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const marketData = sqliteTable("market_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull(),
  price: text("price").notNull(),
  volume: text("volume"),
  bid: text("bid"),
  ask: text("ask"),
  change24h: text("change24h"),
  marketCap: text("marketCap"),
  timestamp: integer("timestamp").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const tradingSignals = sqliteTable("trading_signals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull(),
  action: text("action", { enum: ["BUY", "SELL", "HOLD"] }).notNull(),
  confidence: text("confidence").notNull(),
  score: text("score").notNull(),
  technicalScore: text("technicalScore"),
  onChainScore: text("onChainScore"),
  sentimentScore: text("sentimentScore"),
  macroScore: text("macroScore"),
  reasoning: text("reasoning"),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const whaleAlerts = sqliteTable("whale_alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  walletAddress: text("walletAddress").notNull(),
  tokenAddress: text("tokenAddress").notNull(),
  amount: text("amount").notNull(),
  usdValue: text("usdValue"),
  transactionHash: text("transactionHash"),
  alertType: text("alertType", { enum: ["LARGE_BUY", "LARGE_SELL", "EXCHANGE_INFLOW", "EXCHANGE_OUTFLOW"] }).notNull(),
  blockchain: text("blockchain"),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const socialSentiment = sqliteTable("social_sentiment", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull(),
  source: text("source", { enum: ["TWITTER", "TELEGRAM", "DISCORD", "REDDIT"] }).notNull(),
  sentimentScore: text("sentimentScore").notNull(),
  bullishCount: int("bullishCount"),
  bearishCount: int("bearishCount"),
  neutralCount: int("neutralCount"),
  volume: int("volume"),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const exchangeApiKeys = sqliteTable("exchange_api_keys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull(),
  exchange: text("exchange").notNull(),
  apiKey: text("apiKey").notNull(),
  secretKey: text("secretKey").notNull(),
  passphrase: text("passphrase"),
  isActive: integer("isActive").default(1).notNull(),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const userPreferences = sqliteTable("user_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull(),
  riskProfile: text("riskProfile", { enum: ["LOW", "MEDIUM", "HIGH"] }).default("MEDIUM").notNull(),
  autoTradingEnabled: integer("autoTradingEnabled").default(0).notNull(),
  maxLeverage: text("maxLeverage").default("1.0").notNull(),
  maxDailyLoss: text("maxDailyLoss"),
  watchlistSymbols: text("watchlistSymbols"),
  notificationsEnabled: integer("notificationsEnabled").default(1).notNull(),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const tradeHistory = sqliteTable("trade_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull(),
  symbol: text("symbol").notNull(),
  side: text("side", { enum: ["BUY", "SELL"] }).notNull(),
  quantity: text("quantity").notNull(),
  price: text("price").notNull(),
  totalValue: text("totalValue").notNull(),
  leverage: text("leverage").default("1.0"),
  stopLoss: text("stopLoss"),
  takeProfit: text("takeProfit"),
  status: text("status", { enum: ["OPEN", "CLOSED", "CANCELLED"] }).notNull(),
  pnl: text("pnl"),
  exchange: text("exchange").notNull(),
  orderId: text("orderId"),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull(),
  closedAt: integer("closedAt"),
});

export const onChainData = sqliteTable("on_chain_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull(),
  blockchain: text("blockchain").notNull(),
  exchangeInflow: text("exchangeInflow"),
  exchangeOutflow: text("exchangeOutflow"),
  whaleMovements: int("whaleMovements"),
  stablecoinInflow: text("stablecoinInflow"),
  stablecoinOutflow: text("stablecoinOutflow"),
  activeAddresses: int("activeAddresses"),
  transactionVolume: text("transactionVolume"),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const newsEvents = sqliteTable("news_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  source: text("source").notNull(),
  sentiment: text("sentiment", { enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"] }).notNull(),
  url: text("url"),
  importance: text("importance", { enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] }).default("MEDIUM"),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const tradingConfigs = sqliteTable("trading_configs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull(),
  enabled: integer("enabled").default(0).notNull(),
  maxPositionSize: text("maxPositionSize").default("1000").notNull(),
  maxLeverage: int("maxLeverage").default(5).notNull(),
  stopLossPercent: text("stopLossPercent").default("2").notNull(),
  takeProfitPercent: text("takeProfitPercent").default("5").notNull(),
  minConfidence: int("minConfidence").default(60).notNull(),
  tradingPairs: text("tradingPairs").default("[]").notNull(),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(strftime('%s', 'now'))`).notNull(),
});
