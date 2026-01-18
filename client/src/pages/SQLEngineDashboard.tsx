import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, TrendingDown, Activity, Zap, Wallet, MessageSquare, BarChart3, Settings, Cpu, Flame } from 'lucide-react';
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

export default function SQLEngineDashboard() {
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
          background: { color: '#0f0f0f' },
          textColor: '#d4af37',
        },
        grid: {
          vertLines: { color: '#2a2a2a' },
          horzLines: { color: '#2a2a2a' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const lineSeries = chart.addLineSeries({
        color: '#d4af37',
        lineWidth: 3,
      });

      // Sample data
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
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)' }}>
        <Card className="w-full max-w-md" style={{ background: '#1a1a1a', borderColor: '#d4af37' }}>
          <CardHeader>
            <CardTitle style={{ color: '#d4af37' }}>⚙️ SQL ENGINE PRO</CardTitle>
            <CardDescription>Advanced Crypto Intelligence Terminal</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" style={{ background: '#d4af37', color: '#0f0f0f' }} onClick={() => window.location.href = '/login'}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)' }}>
      {/* Header */}
      <header className="border-b" style={{ background: '#0f0f0f', borderColor: '#d4af37' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black" style={{ color: '#d4af37', textShadow: '0 0 20px rgba(212, 175, 55, 0.5)' }}>
              ⚙️ SQL ENGINE PRO
            </h1>
            <p className="text-sm mt-1" style={{ color: '#999' }}>Real-time Crypto Intelligence | AI-Powered Trading Signals</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2" style={{ color: '#d4af37' }}>
              <Cpu className="w-4 h-4 animate-spin" />
              <span className="text-sm">LIVE</span>
            </div>
            <span className="text-sm" style={{ color: '#999' }}>{user?.name || 'User'}</span>
            <Button variant="outline" onClick={logout} style={{ borderColor: '#d4af37', color: '#d4af37' }}>
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
            <Card 
              key={data.symbol} 
              className="hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              style={{ 
                background: '#1a1a1a', 
                borderColor: '#d4af37',
                borderWidth: '2px'
              }}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg" style={{ color: '#d4af37' }}>{data.symbol}</h3>
                  <Badge 
                    variant={data.change24h >= 0 ? 'default' : 'destructive'}
                    style={{ 
                      background: data.change24h >= 0 ? '#00ff88' : '#ff3366',
                      color: '#000'
                    }}
                  >
                    {data.change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {Math.abs(data.change24h).toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-3xl font-black" style={{ color: '#ffffff' }}>${data.price.toLocaleString()}</p>
                <p className="text-xs mt-2" style={{ color: '#666' }}>Market Cap: ${(data.marketCap / 1e9).toFixed(0)}B</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList 
            className="grid w-full grid-cols-8 mb-6"
            style={{ background: '#1a1a1a', borderColor: '#d4af37' }}
          >
            {[
              { value: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
              { value: 'signals', label: 'Signals', icon: <Zap className="w-4 h-4" /> },
              { value: 'whales', label: 'Whales', icon: <Wallet className="w-4 h-4" /> },
              { value: 'sentiment', label: 'Sentiment', icon: <MessageSquare className="w-4 h-4" /> },
              { value: 'onchain', label: 'On-Chain', icon: <Activity className="w-4 h-4" /> },
              { value: 'solana', label: 'Solana', icon: <Flame className="w-4 h-4" /> },
              { value: 'trading', label: 'Trading', icon: <Activity className="w-4 h-4" /> },
              { value: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="flex items-center gap-2"
                style={{
                  color: activeTab === tab.value ? '#0f0f0f' : '#999',
                  background: activeTab === tab.value ? '#d4af37' : 'transparent',
                }}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card style={{ background: '#1a1a1a', borderColor: '#d4af37', borderWidth: '2px' }}>
              <CardHeader>
                <CardTitle style={{ color: '#d4af37' }}>Price Chart - {selectedSymbol}</CardTitle>
                <CardDescription>Real-time price movement with advanced analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={chartContainerRef} className="w-full h-96 rounded-lg" style={{ background: '#0f0f0f' }} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-6">
            <Card style={{ background: '#1a1a1a', borderColor: '#d4af37', borderWidth: '2px' }}>
              <CardHeader>
                <CardTitle style={{ color: '#d4af37' }}>⚡ AI Trading Signals</CardTitle>
                <CardDescription>Real-time BUY/SELL/HOLD recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {signals.map((signal) => (
                    <div 
                      key={signal.symbol} 
                      className="border rounded-lg p-4 hover:shadow-lg transition-all"
                      style={{ 
                        background: '#0f0f0f',
                        borderColor: '#d4af37',
                        borderWidth: '1px'
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg" style={{ color: '#d4af37' }}>{signal.symbol}</h4>
                        <Badge
                          style={{
                            background: signal.action === 'BUY' ? '#00ff88' : signal.action === 'SELL' ? '#ff3366' : '#666',
                            color: '#000'
                          }}
                        >
                          {signal.action}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs" style={{ color: '#666' }}>Confidence</p>
                          <p className="text-lg font-bold" style={{ color: '#d4af37' }}>{(signal.confidence * 100).toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: '#666' }}>Score</p>
                          <p className="text-lg font-bold" style={{ color: '#d4af37' }}>{signal.score}/100</p>
                        </div>
                      </div>
                      <p className="text-sm" style={{ color: '#999' }}>{signal.reasoning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Whale Alerts Tab */}
          <TabsContent value="whales" className="space-y-6">
            <Card style={{ background: '#1a1a1a', borderColor: '#d4af37', borderWidth: '2px' }}>
              <CardHeader>
                <CardTitle style={{ color: '#d4af37' }}>🐋 Whale Movements</CardTitle>
                <CardDescription>Large wallet transactions detected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {whaleAlerts.map((alert, idx) => (
                    <Alert 
                      key={idx} 
                      style={{
                        background: alert.type === 'BUY' ? '#0a3a0a' : '#3a0a0a',
                        borderColor: alert.type === 'BUY' ? '#00ff88' : '#ff3366',
                        borderWidth: '2px'
                      }}
                    >
                      <AlertCircle className="h-4 w-4" style={{ color: alert.type === 'BUY' ? '#00ff88' : '#ff3366' }} />
                      <AlertDescription>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold" style={{ color: alert.type === 'BUY' ? '#00ff88' : '#ff3366' }}>
                              {alert.type === 'BUY' ? '🟢 Large Buy' : '🔴 Large Sell'}
                            </p>
                            <p className="text-sm" style={{ color: '#999' }}>{alert.walletAddress}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold" style={{ color: '#d4af37' }}>${alert.usdValue.toLocaleString()}</p>
                            <p className="text-xs" style={{ color: '#666' }}>{alert.timestamp}</p>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Tabs */}
          {['sentiment', 'onchain', 'solana', 'trading', 'settings'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6">
              <Card style={{ background: '#1a1a1a', borderColor: '#d4af37', borderWidth: '2px' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#d4af37' }}>
                    {tab === 'sentiment' && '💬 Social Media Sentiment'}
                    {tab === 'onchain' && '⛓️ On-Chain Data'}
                    {tab === 'solana' && '🔥 Solana Deep Dive'}
                    {tab === 'trading' && '📈 Auto-Trading'}
                    {tab === 'settings' && '⚙️ Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p style={{ color: '#999' }}>Content coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
