import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, TrendingDown, Activity, Zap, Wallet, MessageSquare, BarChart3, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

declare global {
  interface Window {
    LightweightCharts: any;
  }
}

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
}

interface Signal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  score: number;
  reasoning: string;
}

interface WhaleAlert {
  walletAddress: string;
  amount: number;
  usdValue: number;
  type: 'BUY' | 'SELL';
  timestamp: string;
}

export default function CryptoDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [whaleAlerts, setWhaleAlerts] = useState<WhaleAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');

  // Initialize chart
  useEffect(() => {
    if (chartContainerRef.current && window.LightweightCharts) {
      const chart = window.LightweightCharts.createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { color: '#ffffff' },
          textColor: '#333333',
        },
        grid: {
          vertLines: { color: '#e0e0e0' },
          horzLines: { color: '#e0e0e0' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const lineSeries = chart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
      });

      // Sample data - replace with real data
      const sampleData = [
        { time: '2025-01-16', value: 42000 },
        { time: '2025-01-17', value: 43500 },
        { time: '2025-01-18', value: 42800 },
      ];

      lineSeries.setData(sampleData);
      chart.timeScale().fitContent();

      return () => {
        chart.remove();
      };
    }
  }, []);

  // Fetch market data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Replace with actual API calls
        const mockMarketData: MarketData[] = [
          { symbol: 'BTC', price: 42500, change24h: 2.5, volume: 28000000000, marketCap: 835000000000 },
          { symbol: 'ETH', price: 2300, change24h: -1.2, volume: 15000000000, marketCap: 276000000000 },
          { symbol: 'SOL', price: 185, change24h: 5.8, volume: 2000000000, marketCap: 82000000000 },
        ];

        const mockSignals: Signal[] = [
          {
            symbol: 'BTC',
            action: 'BUY',
            confidence: 0.85,
            score: 78,
            reasoning: 'Strong technical indicators with positive on-chain data',
          },
          {
            symbol: 'ETH',
            action: 'HOLD',
            confidence: 0.6,
            score: 55,
            reasoning: 'Mixed signals - wait for clearer direction',
          },
          {
            symbol: 'SOL',
            action: 'BUY',
            confidence: 0.72,
            score: 72,
            reasoning: 'Whale accumulation detected with positive sentiment',
          },
        ];

        const mockWhaleAlerts: WhaleAlert[] = [
          {
            walletAddress: '0x1234...5678',
            amount: 50,
            usdValue: 2125000,
            type: 'BUY',
            timestamp: '2 minutes ago',
          },
          {
            walletAddress: '0x9876...5432',
            amount: 1000,
            usdValue: 2300000,
            type: 'BUY',
            timestamp: '5 minutes ago',
          },
        ];

        setMarketData(mockMarketData);
        setSignals(mockSignals);
        setWhaleAlerts(mockWhaleAlerts);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Crypto Intelligence System</CardTitle>
            <CardDescription>Please log in to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/login'}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">⚙️ SQL ENGINE PRO</h1>
            <p className="text-sm text-slate-600">Advanced Crypto Intelligence Terminal | Real-time Analysis & AI Signals</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name || 'User'}</span>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {marketData.map((data) => (
            <Card key={data.symbol} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{data.symbol}</h3>
                  <Badge variant={data.change24h >= 0 ? 'default' : 'destructive'}>
                    {data.change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {Math.abs(data.change24h).toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-slate-900">${data.price.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-2">Market Cap: ${(data.marketCap / 1e9).toFixed(0)}B</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="signals" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Signals</span>
            </TabsTrigger>
            <TabsTrigger value="whales" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Whales</span>
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Sentiment</span>
            </TabsTrigger>
            <TabsTrigger value="onchain" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">On-Chain</span>
            </TabsTrigger>
            <TabsTrigger value="solana" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Solana</span>
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Trading</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Chart - {selectedSymbol}</CardTitle>
                <CardDescription>Real-time price movement with Lightweight Charts</CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={chartContainerRef} className="w-full h-96 bg-white rounded-lg" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Trading Signals</CardTitle>
                <CardDescription>Real-time BUY/SELL/HOLD recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {signals.map((signal) => (
                    <div key={signal.symbol} className="border rounded-lg p-4 hover:bg-slate-50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-lg">{signal.symbol}</h4>
                        <Badge
                          variant={
                            signal.action === 'BUY'
                              ? 'default'
                              : signal.action === 'SELL'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {signal.action}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-slate-600">Confidence</p>
                          <p className="text-lg font-bold">{(signal.confidence * 100).toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Score</p>
                          <p className="text-lg font-bold">{signal.score}/100</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700">{signal.reasoning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Whale Alerts Tab */}
          <TabsContent value="whales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🐋 Whale Movements</CardTitle>
                <CardDescription>Large wallet transactions detected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {whaleAlerts.map((alert, idx) => (
                    <Alert key={idx} className={alert.type === 'BUY' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{alert.type === 'BUY' ? '🟢 Large Buy' : '🔴 Large Sell'}</p>
                            <p className="text-sm text-slate-600">{alert.walletAddress}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${alert.usdValue.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">{alert.timestamp}</p>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sentiment Tab */}
          <TabsContent value="sentiment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Sentiment</CardTitle>
                <CardDescription>Twitter, Telegram, Discord analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-slate-600">Sentiment analysis data will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* On-Chain Tab */}
          <TabsContent value="onchain" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>On-Chain Data</CardTitle>
                <CardDescription>Exchange flows, whale tracking, stablecoin movements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-slate-600">On-chain metrics will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Solana Tab */}
          <TabsContent value="solana" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solana Deep Dive</CardTitle>
                <CardDescription>Mempool monitoring, DEX liquidity, whale tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-slate-600">Solana-specific analysis will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Trading</CardTitle>
                <CardDescription>Connect exchange API and enable automated trading</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Connect your exchange API to enable automated trading based on AI signals
                    </AlertDescription>
                  </Alert>
                  <Button className="w-full">Connect Exchange API</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure your preferences and risk parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-slate-600">Settings panel will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
