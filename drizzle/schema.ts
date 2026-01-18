import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Market Data Table - Real-time price, volume, and technical data
export const marketData = mysqlTable("market_data", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  price: decimal("price", { precision: 20, scale: 8 }).notNull(),
  volume: decimal("volume", { precision: 20, scale: 8 }),
  bid: decimal("bid", { precision: 20, scale: 8 }),
  ask: decimal("ask", { precision: 20, scale: 8 }),
  change24h: decimal("change24h", { precision: 5, scale: 2 }),
  marketCap: decimal("marketCap", { precision: 20, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = typeof marketData.$inferInsert;

// Trading Signals Table - AI-generated buy/sell signals
export const tradingSignals = mysqlTable("trading_signals", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  action: mysqlEnum("action", ["BUY", "SELL", "HOLD"]).notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  technicalScore: decimal("technicalScore", { precision: 5, scale: 2 }),
  onChainScore: decimal("onChainScore", { precision: 5, scale: 2 }),
  sentimentScore: decimal("sentimentScore", { precision: 5, scale: 2 }),
  macroScore: decimal("macroScore", { precision: 5, scale: 2 }),
  reasoning: text("reasoning"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = typeof tradingSignals.$inferInsert;

// Whale Alerts Table - Large wallet movements
export const whaleAlerts = mysqlTable("whale_alerts", {
  id: int("id").autoincrement().primaryKey(),
  walletAddress: varchar("walletAddress", { length: 255 }).notNull(),
  tokenAddress: varchar("tokenAddress", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  usdValue: decimal("usdValue", { precision: 20, scale: 2 }),
  transactionHash: varchar("transactionHash", { length: 255 }),
  alertType: mysqlEnum("alertType", ["LARGE_BUY", "LARGE_SELL", "EXCHANGE_INFLOW", "EXCHANGE_OUTFLOW"]).notNull(),
  blockchain: varchar("blockchain", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WhaleAlert = typeof whaleAlerts.$inferSelect;
export type InsertWhaleAlert = typeof whaleAlerts.$inferInsert;

// Social Sentiment Table - Twitter, Telegram, Discord sentiment
export const socialSentiment = mysqlTable("social_sentiment", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  source: mysqlEnum("source", ["TWITTER", "TELEGRAM", "DISCORD", "REDDIT"]).notNull(),
  sentimentScore: decimal("sentimentScore", { precision: 5, scale: 2 }).notNull(),
  bullishCount: int("bullishCount"),
  bearishCount: int("bearishCount"),
  neutralCount: int("neutralCount"),
  volume: int("volume"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialSentiment = typeof socialSentiment.$inferSelect;
export type InsertSocialSentiment = typeof socialSentiment.$inferInsert;

// User Exchange API Keys Table - Encrypted exchange credentials
export const exchangeApiKeys = mysqlTable("exchange_api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exchange: varchar("exchange", { length: 50 }).notNull(),
  apiKey: text("apiKey").notNull(), // Encrypted
  secretKey: text("secretKey").notNull(), // Encrypted
  passphrase: text("passphrase"), // For some exchanges
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExchangeApiKey = typeof exchangeApiKeys.$inferSelect;
export type InsertExchangeApiKey = typeof exchangeApiKeys.$inferInsert;

// User Trading Preferences Table
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  riskProfile: mysqlEnum("riskProfile", ["LOW", "MEDIUM", "HIGH"]).default("MEDIUM").notNull(),
  autoTradingEnabled: boolean("autoTradingEnabled").default(false).notNull(),
  maxLeverage: decimal("maxLeverage", { precision: 3, scale: 1 }).default("1.0").notNull(),
  maxDailyLoss: decimal("maxDailyLoss", { precision: 5, scale: 2 }),
  watchlistSymbols: text("watchlistSymbols"), // JSON array
  notificationsEnabled: boolean("notificationsEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

// Trading History Table
export const tradeHistory = mysqlTable("trade_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  side: mysqlEnum("side", ["BUY", "SELL"]).notNull(),
  quantity: decimal("quantity", { precision: 20, scale: 8 }).notNull(),
  price: decimal("price", { precision: 20, scale: 8 }).notNull(),
  totalValue: decimal("totalValue", { precision: 20, scale: 2 }).notNull(),
  leverage: decimal("leverage", { precision: 3, scale: 1 }).default("1.0"),
  stopLoss: decimal("stopLoss", { precision: 20, scale: 8 }),
  takeProfit: decimal("takeProfit", { precision: 20, scale: 8 }),
  status: mysqlEnum("status", ["OPEN", "CLOSED", "CANCELLED"]).notNull(),
  pnl: decimal("pnl", { precision: 20, scale: 2 }),
  exchange: varchar("exchange", { length: 50 }).notNull(),
  orderId: varchar("orderId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  closedAt: timestamp("closedAt"),
});

export type TradeHistory = typeof tradeHistory.$inferSelect;
export type InsertTradeHistory = typeof tradeHistory.$inferInsert;

// On-Chain Data Table
export const onChainData = mysqlTable("on_chain_data", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  blockchain: varchar("blockchain", { length: 50 }).notNull(),
  exchangeInflow: decimal("exchangeInflow", { precision: 20, scale: 8 }),
  exchangeOutflow: decimal("exchangeOutflow", { precision: 20, scale: 8 }),
  whaleMovements: int("whaleMovements"),
  stablecoinInflow: decimal("stablecoinInflow", { precision: 20, scale: 8 }),
  stablecoinOutflow: decimal("stablecoinOutflow", { precision: 20, scale: 8 }),
  activeAddresses: int("activeAddresses"),
  transactionVolume: decimal("transactionVolume", { precision: 20, scale: 8 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OnChainData = typeof onChainData.$inferSelect;
export type InsertOnChainData = typeof onChainData.$inferInsert;

// News & Events Table
export const newsEvents = mysqlTable("news_events", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  source: varchar("source", { length: 100 }).notNull(),
  sentiment: mysqlEnum("sentiment", ["POSITIVE", "NEGATIVE", "NEUTRAL"]).notNull(),
  url: text("url"),
  importance: mysqlEnum("importance", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsEvent = typeof newsEvents.$inferSelect;
export type InsertNewsEvent = typeof newsEvents.$inferInsert;

// Trading Configuration Table
export const tradingConfigs = mysqlTable("trading_configs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  maxPositionSize: decimal("maxPositionSize", { precision: 12, scale: 2 }).default("1000").notNull(),
  maxLeverage: int("maxLeverage").default(5).notNull(),
  stopLossPercent: decimal("stopLossPercent", { precision: 5, scale: 2 }).default("2").notNull(),
  takeProfitPercent: decimal("takeProfitPercent", { precision: 5, scale: 2 }).default("5").notNull(),
  minConfidence: int("minConfidence").default(60).notNull(),
  tradingPairs: text("tradingPairs").default(JSON.stringify([])).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TradingConfig = typeof tradingConfigs.$inferSelect;
export type InsertTradingConfig = typeof tradingConfigs.$inferInsert;

// Helper to parse trading pairs
export function parseTradingPairs(data: TradingConfig | InsertTradingConfig): string[] {
  try {
    const pairs = data.tradingPairs;
    if (typeof pairs === 'string') {
      return JSON.parse(pairs);
    }
    return Array.isArray(pairs) ? pairs : [];
  } catch {
    return [];
  }
}

// TODO: Add your additional tables here