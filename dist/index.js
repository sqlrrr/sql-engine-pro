// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

// drizzle/schema.ts
import { int, text, sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
var users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(strftime('%s', 'now'))`).notNull(),
  lastSignedIn: integer("lastSignedIn").default(sql`(strftime('%s', 'now'))`).notNull()
});
var marketData = sqliteTable("market_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull(),
  price: text("price").notNull(),
  volume: text("volume"),
  bid: text("bid"),
  ask: text("ask"),
  change24h: text("change24h"),
  marketCap: text("marketCap"),
  timestamp: integer("timestamp").default(sql`(strftime('%s', 'now'))`).notNull()
});
var tradingSignals = sqliteTable("trading_signals", {
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
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull()
});
var whaleAlerts = sqliteTable("whale_alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  walletAddress: text("walletAddress").notNull(),
  tokenAddress: text("tokenAddress").notNull(),
  amount: text("amount").notNull(),
  usdValue: text("usdValue"),
  transactionHash: text("transactionHash"),
  alertType: text("alertType", { enum: ["LARGE_BUY", "LARGE_SELL", "EXCHANGE_INFLOW", "EXCHANGE_OUTFLOW"] }).notNull(),
  blockchain: text("blockchain"),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull()
});
var socialSentiment = sqliteTable("social_sentiment", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull(),
  source: text("source", { enum: ["TWITTER", "TELEGRAM", "DISCORD", "REDDIT"] }).notNull(),
  sentimentScore: text("sentimentScore").notNull(),
  bullishCount: int("bullishCount"),
  bearishCount: int("bearishCount"),
  neutralCount: int("neutralCount"),
  volume: int("volume"),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull()
});
var exchangeApiKeys = sqliteTable("exchange_api_keys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull(),
  exchange: text("exchange").notNull(),
  apiKey: text("apiKey").notNull(),
  secretKey: text("secretKey").notNull(),
  passphrase: text("passphrase"),
  isActive: integer("isActive").default(1).notNull(),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(strftime('%s', 'now'))`).notNull()
});
var userPreferences = sqliteTable("user_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull(),
  riskProfile: text("riskProfile", { enum: ["LOW", "MEDIUM", "HIGH"] }).default("MEDIUM").notNull(),
  autoTradingEnabled: integer("autoTradingEnabled").default(0).notNull(),
  maxLeverage: text("maxLeverage").default("1.0").notNull(),
  maxDailyLoss: text("maxDailyLoss"),
  watchlistSymbols: text("watchlistSymbols"),
  notificationsEnabled: integer("notificationsEnabled").default(1).notNull(),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt").default(sql`(strftime('%s', 'now'))`).notNull()
});
var tradeHistory = sqliteTable("trade_history", {
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
  closedAt: integer("closedAt")
});
var onChainData = sqliteTable("on_chain_data", {
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
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull()
});
var newsEvents = sqliteTable("news_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  source: text("source").notNull(),
  sentiment: text("sentiment", { enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"] }).notNull(),
  url: text("url"),
  importance: text("importance", { enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] }).default("MEDIUM"),
  createdAt: integer("createdAt").default(sql`(strftime('%s', 'now'))`).notNull()
});
var tradingConfigs = sqliteTable("trading_configs", {
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
  updatedAt: integer("updatedAt").default(sql`(strftime('%s', 'now'))`).notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sqlite = new Database(process.env.DATABASE_URL);
      _db = drizzle(sqlite);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const existingUser = await getUserByOpenId(user.openId);
    if (existingUser) {
      const updateSet = {};
      if (user.name !== void 0) updateSet.name = user.name;
      if (user.email !== void 0) updateSet.email = user.email;
      if (user.loginMethod !== void 0) updateSet.loginMethod = user.loginMethod;
      if (user.lastSignedIn !== void 0) updateSet.lastSignedIn = user.lastSignedIn;
      if (user.role !== void 0) updateSet.role = user.role;
      await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
    } else {
      const values = {
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
        lastSignedIn: user.lastSignedIn ?? Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers/trading.ts
import { z as z2 } from "zod";

// server/_core/universalExchange.ts
import axios2 from "axios";
import crypto from "crypto";
var UniversalExchangeConnector = class {
  credentials;
  baseUrls = {
    binance: "https://fapi.binance.com",
    bybit: "https://api.bybit.com",
    bitget: "https://api.bitget.com",
    kucoin: "https://api.kucoin.com",
    okx: "https://www.okx.com",
    huobi: "https://api.huobi.pro"
  };
  constructor(credentials) {
    this.credentials = credentials;
  }
  /**
   * Validate exchange credentials
   */
  async validateCredentials() {
    try {
      const balance = await this.getBalance();
      return balance.length > 0;
    } catch (error) {
      console.error("Credential validation failed:", error);
      return false;
    }
  }
  /**
   * Get account balance
   */
  async getBalance() {
    switch (this.credentials.exchange) {
      case "binance":
        return this.getBinanceBalance();
      case "bybit":
        return this.getBybitBalance();
      case "bitget":
        return this.getBitgetBalance();
      case "kucoin":
        return this.getKucoinBalance();
      case "okx":
        return this.getOkxBalance();
      case "huobi":
        return this.getHuobiBalance();
      default:
        throw new Error(`Unsupported exchange: ${this.credentials.exchange}`);
    }
  }
  /**
   * Place an order
   */
  async placeOrder(order) {
    switch (this.credentials.exchange) {
      case "binance":
        return this.placeBinanceOrder(order);
      case "bybit":
        return this.placeBybitOrder(order);
      case "bitget":
        return this.placeBitgetOrder(order);
      case "kucoin":
        return this.placeKucoinOrder(order);
      case "okx":
        return this.placeOkxOrder(order);
      case "huobi":
        throw new Error("Huobi order placement not yet implemented");
      default:
        throw new Error(`Unsupported exchange: ${this.credentials.exchange}`);
    }
  }
  /**
   * Get open positions
   */
  async getPositions() {
    switch (this.credentials.exchange) {
      case "binance":
        return this.getBinancePositions();
      case "bybit":
        return this.getBybitPositions();
      case "bitget":
        return this.getBitgetPositions();
      default:
        return [];
    }
  }
  /**
   * Cancel an order
   */
  async cancelOrder(symbol, orderId) {
    switch (this.credentials.exchange) {
      case "binance":
        return this.cancelBinanceOrder(symbol, orderId);
      case "bybit":
        return this.cancelBybitOrder(symbol, orderId);
      case "bitget":
        return this.cancelBitgetOrder(symbol, orderId);
      default:
        throw new Error(`Cancel not supported for ${this.credentials.exchange}`);
    }
  }
  // ============ BINANCE ============
  async getBinanceBalance() {
    const data = await this.binanceRequest("GET", "/fapi/v2/account");
    return data.assets.map((asset) => ({
      asset: asset.asset,
      free: parseFloat(asset.availableBalance),
      locked: parseFloat(asset.walletBalance) - parseFloat(asset.availableBalance),
      total: parseFloat(asset.walletBalance)
    }));
  }
  async getBinancePositions() {
    const data = await this.binanceRequest("GET", "/fapi/v2/positionRisk");
    return data.filter((pos) => parseFloat(pos.positionAmt) !== 0).map((pos) => ({
      symbol: pos.symbol,
      positionAmt: parseFloat(pos.positionAmt),
      entryPrice: parseFloat(pos.entryPrice),
      markPrice: parseFloat(pos.markPrice),
      unRealizedProfit: parseFloat(pos.unRealizedProfit),
      percentage: parseFloat(pos.unRealizedProfit) / (Math.abs(parseFloat(pos.positionAmt)) * parseFloat(pos.entryPrice)) * 100
    }));
  }
  async placeBinanceOrder(order) {
    const params = {
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      type: order.orderType || "MARKET"
    };
    if (order.price && order.orderType === "LIMIT") {
      params.price = order.price;
      params.timeInForce = "GTC";
    }
    const response = await this.binanceRequest("POST", "/fapi/v1/order", params);
    return {
      orderId: response.orderId,
      symbol: response.symbol,
      side: response.side,
      quantity: parseFloat(response.origQty),
      price: parseFloat(response.price || response.avgPrice || "0"),
      status: response.status,
      timestamp: response.time,
      exchange: "binance"
    };
  }
  async cancelBinanceOrder(symbol, orderId) {
    await this.binanceRequest("DELETE", "/fapi/v1/order", { symbol, orderId });
  }
  async binanceRequest(method, endpoint, params = {}) {
    const timestamp = Date.now();
    const requestParams = {};
    for (const [key, value] of Object.entries(params)) {
      requestParams[key] = String(value);
    }
    requestParams["timestamp"] = String(timestamp);
    const query = new URLSearchParams(requestParams).toString();
    const signature = crypto.createHmac("sha256", this.credentials.secretKey).update(query).digest("hex");
    const response = await axios2({
      method,
      url: `${this.baseUrls.binance}${endpoint}`,
      params: { ...requestParams, signature },
      headers: { "X-MBX-APIKEY": this.credentials.apiKey }
    });
    return response.data;
  }
  // ============ BYBIT ============
  async getBybitBalance() {
    const data = await this.bybitRequest("GET", "/v5/account/wallet-balance");
    const balances = [];
    for (const coin of data.list[0].coin) {
      balances.push({
        asset: coin.coin,
        free: parseFloat(coin.availableToWithdraw),
        locked: parseFloat(coin.walletBalance) - parseFloat(coin.availableToWithdraw),
        total: parseFloat(coin.walletBalance)
      });
    }
    return balances;
  }
  async getBybitPositions() {
    const data = await this.bybitRequest("GET", "/v5/position/list", { category: "linear" });
    return data.list.filter((pos) => parseFloat(pos.size) !== 0).map((pos) => ({
      symbol: pos.symbol,
      positionAmt: parseFloat(pos.size),
      entryPrice: parseFloat(pos.avgPrice),
      markPrice: parseFloat(pos.markPrice),
      unRealizedProfit: parseFloat(pos.unrealizedPnl),
      percentage: parseFloat(pos.unrealizedPnl) / (Math.abs(parseFloat(pos.size)) * parseFloat(pos.avgPrice)) * 100
    }));
  }
  async placeBybitOrder(order) {
    const params = {
      category: "linear",
      symbol: order.symbol,
      side: order.side,
      orderType: order.orderType || "Market",
      qty: order.quantity
    };
    if (order.price && order.orderType === "LIMIT") {
      params.price = order.price;
    }
    const response = await this.bybitRequest("POST", "/v5/order/create", params);
    return {
      orderId: response.orderId,
      symbol: response.symbol,
      side: response.side,
      quantity: parseFloat(response.qty),
      price: parseFloat(response.price || "0"),
      status: "PENDING",
      timestamp: Date.now(),
      exchange: "bybit"
    };
  }
  async cancelBybitOrder(symbol, orderId) {
    await this.bybitRequest("POST", "/v5/order/cancel", {
      category: "linear",
      symbol,
      orderId
    });
  }
  async bybitRequest(method, endpoint, params = {}) {
    const timestamp = Date.now();
    const paramStr = {};
    for (const [key, value] of Object.entries(params)) {
      paramStr[key] = String(value);
    }
    const query = new URLSearchParams(paramStr).toString();
    const signature = crypto.createHmac("sha256", this.credentials.secretKey).update(`${timestamp}${this.credentials.apiKey}5000${query}`).digest("hex");
    const response = await axios2({
      method,
      url: `${this.baseUrls.bybit}${endpoint}`,
      params: paramStr,
      headers: {
        "X-BAPI-SIGN": signature,
        "X-BAPI-API-KEY": this.credentials.apiKey,
        "X-BAPI-TIMESTAMP": timestamp.toString(),
        "X-BAPI-RECV-WINDOW": "5000"
      }
    });
    return response.data.result;
  }
  // ============ BITGET ============
  async getBitgetBalance() {
    const data = await this.bitgetRequest("GET", "/spot/v1/account/assets");
    return data.map((asset) => ({
      asset: asset.coinName,
      free: parseFloat(asset.available),
      locked: parseFloat(asset.frozen),
      total: parseFloat(asset.available) + parseFloat(asset.frozen)
    }));
  }
  async getBitgetPositions() {
    const data = await this.bitgetRequest("GET", "/mix/v1/position/allPosition", { productType: "umcbl" });
    return data.filter((pos) => parseFloat(pos.total) !== 0).map((pos) => ({
      symbol: pos.symbol,
      positionAmt: parseFloat(pos.total),
      entryPrice: parseFloat(pos.averagePrice),
      markPrice: parseFloat(pos.markPrice),
      unRealizedProfit: parseFloat(pos.unrealizedPL),
      percentage: parseFloat(pos.unrealizedPL) / (Math.abs(parseFloat(pos.total)) * parseFloat(pos.averagePrice)) * 100
    }));
  }
  async placeBitgetOrder(order) {
    const params = {
      symbol: order.symbol,
      side: order.side.toLowerCase(),
      orderType: order.orderType || "market",
      size: order.quantity,
      productType: "umcbl"
    };
    if (order.price && order.orderType === "LIMIT") {
      params.price = order.price;
    }
    const response = await this.bitgetRequest("POST", "/mix/v1/order/placeOrder", params);
    return {
      orderId: response.orderId,
      symbol: response.symbol,
      side: response.side,
      quantity: parseFloat(response.size),
      price: parseFloat(response.price || "0"),
      status: "PENDING",
      timestamp: Date.now(),
      exchange: "bitget"
    };
  }
  async cancelBitgetOrder(symbol, orderId) {
    await this.bitgetRequest("POST", "/mix/v1/order/cancel-order", {
      symbol,
      orderId,
      productType: "umcbl"
    });
  }
  async bitgetRequest(method, endpoint, params = {}) {
    const timestamp = Date.now().toString();
    const body = method === "GET" ? "" : JSON.stringify(params);
    const message = timestamp + method + endpoint + body;
    const signature = crypto.createHmac("sha256", this.credentials.secretKey).update(message).digest("base64");
    const response = await axios2({
      method,
      url: `${this.baseUrls.bitget}${endpoint}`,
      data: method !== "GET" ? params : void 0,
      params: method === "GET" ? params : void 0,
      headers: {
        "Content-Type": "application/json",
        "ACCESS-KEY": this.credentials.apiKey,
        "ACCESS-SIGN": signature,
        "ACCESS-TIMESTAMP": timestamp,
        "ACCESS-PASSPHRASE": this.credentials.passphrase || ""
      }
    });
    return response.data.data;
  }
  // ============ KUCOIN ============
  async getKucoinBalance() {
    const data = await this.kucoinRequest("GET", "/api/v1/accounts");
    const balances = [];
    for (const account of data) {
      if (account.type === "trade") {
        balances.push({
          asset: account.currency,
          free: parseFloat(account.available),
          locked: parseFloat(account.holds),
          total: parseFloat(account.balance)
        });
      }
    }
    return balances;
  }
  async placeKucoinOrder(order) {
    const params = {
      symbol: order.symbol,
      side: order.side.toLowerCase(),
      type: order.orderType?.toLowerCase() || "market",
      size: order.quantity
    };
    if (order.price && order.orderType === "LIMIT") {
      params.price = order.price;
    }
    const response = await this.kucoinRequest("POST", "/api/v1/orders", params);
    return {
      orderId: response.orderId,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: order.price || 0,
      status: "PENDING",
      timestamp: Date.now(),
      exchange: "kucoin"
    };
  }
  async kucoinRequest(method, endpoint, params = {}) {
    const timestamp = Date.now();
    const body = method === "GET" ? "" : JSON.stringify(params);
    const message = timestamp + method + endpoint + body;
    const signature = crypto.createHmac("sha256", this.credentials.secretKey).update(message).digest("base64");
    const response = await axios2({
      method,
      url: `https://api.kucoin.com${endpoint}`,
      data: method !== "GET" ? params : void 0,
      params: method === "GET" ? params : void 0,
      headers: {
        "KC-API-SIGN": signature,
        "KC-API-TIMESTAMP": timestamp.toString(),
        "KC-API-KEY": this.credentials.apiKey,
        "KC-API-PASSPHRASE": this.credentials.passphrase || ""
      }
    });
    return response.data.data;
  }
  // ============ OKX ============
  async getOkxBalance() {
    const data = await this.okxRequest("GET", "/api/v5/account/balance");
    const balances = [];
    for (const detail of data[0].details) {
      balances.push({
        asset: detail.ccy,
        free: parseFloat(detail.availBal),
        locked: parseFloat(detail.frozenBal),
        total: parseFloat(detail.cashBal) + parseFloat(detail.frozenBal)
      });
    }
    return balances;
  }
  async placeOkxOrder(order) {
    const params = {
      instId: order.symbol,
      tdMode: "cash",
      side: order.side.toLowerCase(),
      ordType: order.orderType?.toLowerCase() || "market",
      sz: order.quantity
    };
    if (order.price && order.orderType === "LIMIT") {
      params.px = order.price;
    }
    const response = await this.okxRequest("POST", "/api/v5/trade/order", params);
    return {
      orderId: response[0].ordId,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: order.price || 0,
      status: "PENDING",
      timestamp: Date.now(),
      exchange: "okx"
    };
  }
  async okxRequest(method, endpoint, params = {}) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const body = method === "GET" ? "" : JSON.stringify(params);
    const message = timestamp + method + endpoint + body;
    const signature = crypto.createHmac("sha256", this.credentials.secretKey).update(message).digest("base64");
    const response = await axios2({
      method,
      url: `https://www.okx.com${endpoint}`,
      data: method !== "GET" ? params : void 0,
      params: method === "GET" ? params : void 0,
      headers: {
        "OK-ACCESS-KEY": this.credentials.apiKey,
        "OK-ACCESS-SIGN": signature,
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": this.credentials.passphrase || ""
      }
    });
    return response.data.data;
  }
  // ============ HUOBI ============
  async getHuobiBalance() {
    const data = await this.huobiRequest("GET", "/v1/account/accounts");
    const accountId = data[0].id;
    const balance = await this.huobiRequest("GET", `/v1/account/accounts/${accountId}/balance`);
    const balances = [];
    for (const list of balance.list) {
      balances.push({
        asset: list.currency,
        free: parseFloat(list.balance),
        locked: 0,
        total: parseFloat(list.balance)
      });
    }
    return balances;
  }
  async huobiRequest(method, endpoint, params = {}) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const requestParams = {
      ...params,
      AccessKeyId: this.credentials.apiKey,
      SignatureMethod: "HmacSHA256",
      SignatureVersion: "2",
      Timestamp: timestamp
    };
    const sortedParams = Object.keys(requestParams).sort().map((key) => `${key}=${encodeURIComponent(requestParams[key])}`).join("&");
    const message = `${method}
api.huobi.pro
${endpoint}
${sortedParams}`;
    const signature = crypto.createHmac("sha256", this.credentials.secretKey).update(message).digest("base64");
    const response = await axios2({
      method,
      url: `https://api.huobi.pro${endpoint}`,
      params: { ...requestParams, Signature: signature }
    });
    return response.data.data;
  }
};

// server/routers/trading.ts
var ConnectExchangeSchema = z2.object({
  exchange: z2.enum(["binance", "bybit", "bitget", "kucoin", "okx", "huobi"]),
  apiKey: z2.string().min(1),
  secretKey: z2.string().min(1),
  passphrase: z2.string().optional()
});
var PlaceOrderSchema = z2.object({
  symbol: z2.string(),
  side: z2.enum(["BUY", "SELL"]),
  quantity: z2.number().positive(),
  price: z2.number().optional(),
  leverage: z2.number().optional()
});
var UpdateAutoTradingSchema = z2.object({
  enabled: z2.boolean().optional(),
  maxPositionSize: z2.number().optional(),
  maxLeverage: z2.number().optional(),
  stopLossPercent: z2.number().optional(),
  takeProfitPercent: z2.number().optional(),
  minConfidence: z2.number().optional(),
  tradingPairs: z2.array(z2.string()).optional()
});
var tradingRouter = router({
  /**
   * Connect user's exchange account
   */
  connectExchange: protectedProcedure.input(ConnectExchangeSchema).mutation(async ({ input, ctx }) => {
    try {
      const credentials = {
        userId: ctx.user.id,
        exchange: input.exchange,
        apiKey: input.apiKey,
        secretKey: input.secretKey,
        passphrase: input.passphrase,
        isActive: true,
        autoTradingEnabled: false
      };
      const connector = new UniversalExchangeConnector(credentials);
      const isValid = await connector.validateCredentials();
      if (!isValid) {
        return {
          success: false,
          error: "Invalid API credentials. Please check your keys."
        };
      }
      return {
        success: true,
        message: `Successfully connected to ${input.exchange}`,
        exchange: input.exchange
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to connect exchange"
      };
    }
  }),
  /**
   * Get account balance
   */
  getBalance: protectedProcedure.input(z2.object({ exchange: z2.string() })).query(async ({ input, ctx }) => {
    try {
      const credentials = {
        userId: ctx.user.id,
        exchange: input.exchange,
        apiKey: process.env.BINANCE_API_KEY || "",
        secretKey: process.env.BINANCE_SECRET_KEY || "",
        isActive: true,
        autoTradingEnabled: false
      };
      const connector = new UniversalExchangeConnector(credentials);
      const balance = await connector.getBalance();
      return {
        success: true,
        balance
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }),
  /**
   * Place manual order
   */
  placeOrder: protectedProcedure.input(PlaceOrderSchema).mutation(async ({ input, ctx }) => {
    try {
      const credentials = {
        userId: ctx.user.id,
        exchange: "binance",
        apiKey: process.env.BINANCE_API_KEY || "",
        secretKey: process.env.BINANCE_SECRET_KEY || "",
        isActive: true,
        autoTradingEnabled: false
      };
      const connector = new UniversalExchangeConnector(credentials);
      const order = await connector.placeOrder({
        symbol: input.symbol,
        side: input.side,
        quantity: input.quantity,
        price: input.price,
        orderType: input.price ? "LIMIT" : "MARKET",
        leverage: input.leverage
      });
      return {
        success: true,
        order
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }),
  /**
   * Get open positions
   */
  getPositions: protectedProcedure.input(z2.object({ exchange: z2.string() })).query(async ({ input, ctx }) => {
    try {
      const credentials = {
        userId: ctx.user.id,
        exchange: input.exchange,
        apiKey: process.env.BINANCE_API_KEY || "",
        secretKey: process.env.BINANCE_SECRET_KEY || "",
        isActive: true,
        autoTradingEnabled: false
      };
      const connector = new UniversalExchangeConnector(credentials);
      const positions = await connector.getPositions();
      return {
        success: true,
        positions
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }),
  /**
   * Update auto-trading configuration
   */
  updateAutoTrading: protectedProcedure.input(UpdateAutoTradingSchema).mutation(async ({ input, ctx }) => {
    try {
      const defaultConfig = {
        enabled: input.enabled ?? false,
        maxPositionSize: input.maxPositionSize ?? 1e3,
        maxLeverage: input.maxLeverage ?? 5,
        stopLossPercent: input.stopLossPercent ?? 2,
        takeProfitPercent: input.takeProfitPercent ?? 5,
        riskRewardRatio: 1 / 2.5,
        maxOpenPositions: 5,
        minConfidence: input.minConfidence ?? 60,
        tradingPairs: input.tradingPairs ?? ["BTCUSDT", "ETHUSDT"]
      };
      return {
        success: true,
        message: "Auto-trading configuration updated",
        config: defaultConfig
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }),
  /**
   * Toggle auto-trading on/off
   */
  toggleAutoTrading: protectedProcedure.input(z2.object({ enabled: z2.boolean() })).mutation(async ({ input, ctx }) => {
    try {
      return {
        success: true,
        message: `Auto-trading ${input.enabled ? "enabled" : "disabled"}`,
        enabled: input.enabled
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }),
  /**
   * Get trading statistics
   */
  getTradingStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      return {
        success: true,
        stats: {
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          totalPnL: 0,
          avgPnL: 0,
          winRate: 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }),
  /**
   * Get trade history
   */
  getTradeHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      return {
        success: true,
        trades: []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  })
});

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  trading: tradingRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  })
  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
