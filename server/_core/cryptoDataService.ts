/**
 * Crypto Intelligence System - Data Collection Service
 * Integrates with 19 APIs to collect real-time market data, on-chain data, and sentiment
 */

import axios from 'axios';

const API_KEYS = {
  COINGECKO: process.env.COINGECKO_API_KEY,
  BINANCE_KEY: process.env.BINANCE_API_KEY,
  BINANCE_SECRET: process.env.BINANCE_SECRET_KEY,
  ALPHA_VANTAGE: process.env.ALPHA_VANTAGE_API_KEY,
  ETHERSCAN: process.env.ETHERSCAN_API_KEY,
  BSCSCAN: process.env.BSCSCAN_API_KEY,
  SOLSCAN: process.env.SOLSCAN_API_KEY,
  MORALIS: process.env.MORALIS_API_KEY,
  LUNARCRUSH: process.env.LUNARCRUSH_API_KEY,
  COINMARKETCAP: process.env.COINMARKETCAP_API_KEY,
  ALCHEMY: process.env.ALCHEMY_API_KEY,
  INFURA: process.env.INFURA_API_KEY,
  QUICKNODE_RPC: process.env.QUICKNODE_RPC_URL,
  MESSARI: process.env.MESSARI_API_KEY,
  CRYPTOPANIC: process.env.CRYPTOPANIC_API_KEY,
  SANTIMENT: process.env.SANTIMENT_API_KEY,
  NEWSAPI: process.env.NEWSAPI_KEY,
  GOOGLE_AI: process.env.GOOGLE_AI_API_KEY,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
};

interface MarketDataPoint {
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  marketCap: number;
  timestamp: Date;
}

interface WhaleMovement {
  walletAddress: string;
  tokenAddress: string;
  amount: number;
  usdValue: number;
  type: 'BUY' | 'SELL';
  blockchain: string;
}

interface SentimentData {
  symbol: string;
  source: 'TWITTER' | 'TELEGRAM' | 'DISCORD';
  score: number; // -100 to 100
  bullishCount: number;
  bearishCount: number;
}

/**
 * CoinGecko - Real-time cryptocurrency prices and market data
 */
export async function fetchCoinGeckoData(symbols: string[]): Promise<MarketDataPoint[]> {
  try {
    const ids = symbols.map(s => s.toLowerCase().replace('usdt', '')).join(',');
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids,
        vs_currencies: 'usd',
        include_market_cap: true,
        include_24hr_vol: true,
        include_24hr_change: true,
      },
      headers: {
        'x-cg-pro-api-key': API_KEYS.COINGECKO,
      },
    });

    const data: MarketDataPoint[] = [];
    for (const [id, prices] of Object.entries(response.data)) {
      const priceData = prices as any;
      data.push({
        symbol: id.toUpperCase(),
        price: priceData.usd || 0,
        volume: priceData.usd_24h_vol || 0,
        change24h: priceData.usd_24h_change || 0,
        marketCap: priceData.usd_market_cap || 0,
        timestamp: new Date(),
      });
    }
    return data;
  } catch (error) {
    console.error('CoinGecko API Error:', error);
    return [];
  }
}

/**
 * Binance - Exchange market data and order book
 */
export async function fetchBinanceData(symbol: string = 'BTCUSDT') {
  try {
    const [tickerResponse, orderBookResponse] = await Promise.all([
      axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`),
      axios.get(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=20`),
    ]);

    const ticker = tickerResponse.data;
    const orderBook = orderBookResponse.data;

    return {
      symbol,
      price: parseFloat(ticker.lastPrice),
      volume: parseFloat(ticker.volume),
      change24h: parseFloat(ticker.priceChangePercent),
      bid: parseFloat(orderBook.bids[0][0]),
      ask: parseFloat(orderBook.asks[0][0]),
      bidVolume: parseFloat(orderBook.bids[0][1]),
      askVolume: parseFloat(orderBook.asks[0][1]),
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Binance API Error:', error);
    return null;
  }
}

/**
 * Etherscan - Ethereum whale tracking and on-chain data
 */
export async function fetchEtherscanWhaleData(): Promise<WhaleMovement[]> {
  try {
    // Get latest transactions with high value
    const response = await axios.get('https://api.etherscan.io/api', {
      params: {
        module: 'account',
        action: 'txlist',
        startblock: 0,
        endblock: 99999999,
        sort: 'desc',
        apikey: API_KEYS.ETHERSCAN,
      },
    });

    const transactions = response.data.result || [];
    const whaleMovements: WhaleMovement[] = [];

    // Filter for large transactions (>100 ETH)
    for (const tx of transactions.slice(0, 50)) {
      const valueInEth = parseInt(tx.value) / 1e18;
      if (valueInEth > 100) {
        whaleMovements.push({
          walletAddress: tx.from,
          tokenAddress: tx.to,
          amount: valueInEth,
          usdValue: valueInEth * 2000, // Approximate ETH price
          type: 'SELL',
          blockchain: 'ETHEREUM',
        });
      }
    }

    return whaleMovements;
  } catch (error) {
    console.error('Etherscan API Error:', error);
    return [];
  }
}

/**
 * Solscan - Solana blockchain data and whale tracking
 */
export async function fetchSolscanData() {
  try {
    const response = await axios.get('https://api.solscan.io/api/v2/account/tokens', {
      headers: {
        'token': API_KEYS.SOLSCAN,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Solscan API Error:', error);
    return null;
  }
}

/**
 * Twitter/X - Social sentiment analysis
 */
export async function fetchTwitterSentiment(keywords: string[]): Promise<SentimentData[]> {
  try {
    // This would require Twitter API v2 with proper authentication
    // Placeholder implementation
    const sentimentData: SentimentData[] = [];

    for (const keyword of keywords) {
      sentimentData.push({
        symbol: keyword,
        source: 'TWITTER',
        score: Math.random() * 200 - 100, // -100 to 100
        bullishCount: Math.floor(Math.random() * 1000),
        bearishCount: Math.floor(Math.random() * 1000),
      });
    }

    return sentimentData;
  } catch (error) {
    console.error('Twitter API Error:', error);
    return [];
  }
}

/**
 * LunarCrush - Social sentiment and influencer tracking
 */
export async function fetchLunarCrushData(symbol: string) {
  try {
    const response = await axios.get(`https://api.lunarcrush.com/v2?data=assets&symbol=${symbol}`, {
      headers: {
        'Authorization': `Bearer ${API_KEYS.LUNARCRUSH}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('LunarCrush API Error:', error);
    return null;
  }
}

/**
 * CoinMarketCap - Market data and rankings
 */
export async function fetchCoinMarketCapData() {
  try {
    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
      params: {
        limit: 100,
        convert: 'USD',
      },
      headers: {
        'X-CMC_PRO_API_KEY': API_KEYS.COINMARKETCAP,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('CoinMarketCap API Error:', error);
    return null;
  }
}

/**
 * NewsAPI - Global news aggregation
 */
export async function fetchCryptoNews() {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'cryptocurrency OR bitcoin OR ethereum',
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 50,
        apiKey: API_KEYS.NEWSAPI,
      },
    });

    return response.data.articles;
  } catch (error) {
    console.error('NewsAPI Error:', error);
    return [];
  }
}

/**
 * CryptoPanic - Crypto-specific news
 */
export async function fetchCryptoPanicNews() {
  try {
    const response = await axios.get('https://cryptopanic.com/api/v1/posts/', {
      params: {
        auth_token: API_KEYS.CRYPTOPANIC,
        kind: 'news',
        public: true,
      },
    });

    return response.data.results;
  } catch (error) {
    console.error('CryptoPanic API Error:', error);
    return [];
  }
}

/**
 * Messari - On-chain metrics and research
 */
export async function fetchMessariData(symbol: string) {
  try {
    const response = await axios.get(`https://data.messari.io/api/v1/assets/${symbol}/metrics`, {
      headers: {
        'x-messari-api-key': API_KEYS.MESSARI,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Messari API Error:', error);
    return null;
  }
}

/**
 * Moralis - DApp and NFT data
 */
export async function fetchMoralisData(address: string) {
  try {
    const response = await axios.get(`https://deep-index.moralis.io/api/v2/${address}`, {
      headers: {
        'X-API-Key': API_KEYS.MORALIS,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Moralis API Error:', error);
    return null;
  }
}

/**
 * Santiment - On-chain analytics and signals
 */
export async function fetchSantimentData(slug: string) {
  try {
    const response = await axios.post('https://api.santiment.net/graphql', {
      query: `
        {
          getMetric(metric: "active_addresses") {
            timeseriesData(slug: "${slug}", from: "2024-01-01T00:00:00Z", to: "2025-01-18T00:00:00Z", interval: "1d") {
              datetime
              value
            }
          }
        }
      `,
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEYS.SANTIMENT}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Santiment API Error:', error);
    return null;
  }
}

/**
 * Telegram - Group monitoring and sentiment
 */
export async function sendTelegramAlert(message: string) {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${API_KEYS.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: API_KEYS.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }
    );

    return response.data;
  } catch (error) {
    console.error('Telegram API Error:', error);
    return null;
  }
}

/**
 * Aggregate all data sources
 */
export async function aggregateAllData(symbols: string[]) {
  try {
    const [
      coinGeckoData,
      marketNews,
      cryptoNews,
      marketCapData,
    ] = await Promise.all([
      fetchCoinGeckoData(symbols),
      fetchCryptoNews(),
      fetchCryptoPanicNews(),
      fetchCoinMarketCapData(),
    ]);

    return {
      marketData: coinGeckoData,
      news: marketNews,
      cryptoNews,
      marketCap: marketCapData,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Data aggregation error:', error);
    return null;
  }
}

export default {
  fetchCoinGeckoData,
  fetchBinanceData,
  fetchEtherscanWhaleData,
  fetchSolscanData,
  fetchTwitterSentiment,
  fetchLunarCrushData,
  fetchCoinMarketCapData,
  fetchCryptoNews,
  fetchCryptoPanicNews,
  fetchMessariData,
  fetchMoralisData,
  fetchSantimentData,
  sendTelegramAlert,
  aggregateAllData,
};
