import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, Users, Settings, Activity, TrendingUp, AlertCircle, Database, Lock, Zap, MoreVertical } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastSignedIn: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalSignals: number;
  totalTrades: number;
  apiHealth: number;
  databaseStatus: 'healthy' | 'warning' | 'critical';
}

interface APIStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: string;
}

export default function AdminPanel() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Trader', email: 'john@example.com', role: 'user', createdAt: '2025-01-10', lastSignedIn: '2 hours ago' },
    { id: 2, name: 'Admin User', email: 'admin@example.com', role: 'admin', createdAt: '2025-01-01', lastSignedIn: '5 minutes ago' },
  ]);

  const stats: SystemStats = {
    totalUsers: 156,
    activeUsers: 42,
    totalSignals: 1243,
    totalTrades: 3891,
    apiHealth: 99.8,
    databaseStatus: 'healthy',
  };

  const apiStatuses: APIStatus[] = [
    { name: 'CoinGecko', status: 'healthy', responseTime: 145, lastChecked: '2 minutes ago' },
    { name: 'Binance', status: 'healthy', responseTime: 234, lastChecked: '1 minute ago' },
    { name: 'Etherscan', status: 'healthy', responseTime: 312, lastChecked: '3 minutes ago' },
    { name: 'Solscan', status: 'degraded', responseTime: 1200, lastChecked: '1 minute ago' },
  ];

  // Check if user is admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)' }}>
        <Card style={{ background: '#1a1a1a', borderColor: '#d4af37', borderWidth: '2px' }}>
          <CardHeader>
            <CardTitle style={{ color: '#d4af37' }}>🔐 Access Denied</CardTitle>
            <CardDescription>Admin privileges required</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4" style={{ color: '#999' }}>You do not have permission to access this panel.</p>
            <Button onClick={logout} style={{ background: '#d4af37', color: '#0f0f0f' }}>
              Logout
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
              🛡️ ADMIN PANEL
            </h1>
            <p className="text-sm mt-1" style={{ color: '#999' }}>System Management & Monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge style={{ background: '#00ff88', color: '#000' }}>Admin</Badge>
            <span className="text-sm" style={{ color: '#999' }}>{user?.name}</span>
            <Button variant="outline" onClick={logout} style={{ borderColor: '#d4af37', color: '#d4af37' }}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users },
            { label: 'Active Users', value: stats.activeUsers, icon: Activity },
            { label: 'Signals', value: stats.totalSignals, icon: Zap },
            { label: 'Trades', value: stats.totalTrades, icon: TrendingUp },
            { label: 'API Health', value: `${stats.apiHealth}%`, icon: BarChart3 },
            { label: 'DB Status', value: 'Healthy', icon: Database },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} style={{ background: '#1a1a1a', borderColor: '#d4af37', borderWidth: '2px' }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs" style={{ color: '#666' }}>{stat.label}</p>
                      <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>{stat.value}</p>
                    </div>
                    <Icon className="w-8 h-8" style={{ color: '#d4af37', opacity: 0.5 }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6" style={{ background: '#1a1a1a', borderColor: '#d4af37' }}>
            {[
              { value: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
              { value: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
              { value: 'apis', label: 'APIs', icon: <Zap className="w-4 h-4" /> },
              { value: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
              { value: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
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
                <CardTitle style={{ color: '#d4af37' }}>📊 System Overview</CardTitle>
                <CardDescription>Real-time monitoring and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4" style={{ background: '#0f0f0f', borderRadius: '8px' }}>
                    <span style={{ color: '#999' }}>API Response Time (avg)</span>
                    <span style={{ color: '#d4af37', fontSize: '18px', fontWeight: 'bold' }}>234ms</span>
                  </div>
                  <div className="flex justify-between items-center p-4" style={{ background: '#0f0f0f', borderRadius: '8px' }}>
                    <span style={{ color: '#999' }}>Database Connections</span>
                    <span style={{ color: '#d4af37', fontSize: '18px', fontWeight: 'bold' }}>42/100</span>
                  </div>
                  <div className="flex justify-between items-center p-4" style={{ background: '#0f0f0f', borderRadius: '8px' }}>
                    <span style={{ color: '#999' }}>Cache Hit Rate</span>
                    <span style={{ color: '#d4af37', fontSize: '18px', fontWeight: 'bold' }}>87.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card style={{ background: '#1a1a1a', borderColor: '#d4af37', borderWidth: '2px' }}>
              <CardHeader>
                <CardTitle style={{ color: '#d4af37' }}>👥 User Management</CardTitle>
                <CardDescription>Manage system users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex justify-between items-center p-4"
                      style={{ background: '#0f0f0f', borderRadius: '8px', borderLeft: '3px solid #d4af37' }}
                    >
                      <div>
                        <p style={{ color: '#d4af37', fontWeight: 'bold' }}>{u.name}</p>
                        <p style={{ color: '#666', fontSize: '12px' }}>{u.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge style={{ background: u.role === 'admin' ? '#d4af37' : '#666', color: '#000' }}>
                          {u.role}
                        </Badge>
                        <Button size="sm" variant="ghost" style={{ color: '#d4af37' }}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* APIs Tab */}
          <TabsContent value="apis" className="space-y-6">
            <Card style={{ background: '#1a1a1a', borderColor: '#d4af37', borderWidth: '2px' }}>
              <CardHeader>
                <CardTitle style={{ color: '#d4af37' }}>🔌 API Status</CardTitle>
                <CardDescription>Monitor integrated API services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {apiStatuses.map((api, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-4"
                      style={{
                        background: '#0f0f0f',
                        borderRadius: '8px',
                        borderLeft: `3px solid ${api.status === 'healthy' ? '#00ff88' : api.status === 'degraded' ? '#ffaa00' : '#ff3366'}`,
                      }}
                    >
                      <div>
                        <p style={{ color: '#d4af37', fontWeight: 'bold' }}>{api.name}</p>
                        <p style={{ color: '#666', fontSize: '12px' }}>Response: {api.responseTime}ms</p>
                      </div>
                      <Badge
                        style={{
                          background: api.status === 'healthy' ? '#00ff88' : api.status === 'degraded' ? '#ffaa00' : '#ff3366',
                          color: '#000',
                        }}
                      >
                        {api.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card style={{ background: '#1a1a1a', borderColor: '#d4af37', borderWidth: '2px' }}>
              <CardHeader>
                <CardTitle style={{ color: '#d4af37' }}>⚙️ System Settings</CardTitle>
                <CardDescription>Configure system parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4" style={{ background: '#0f0f0f', borderRadius: '8px' }}>
                    <span style={{ color: '#999' }}>Auto-Trading Enabled</span>
                    <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                  </div>
                  <div className="flex justify-between items-center p-4" style={{ background: '#0f0f0f', borderRadius: '8px' }}>
                    <span style={{ color: '#999' }}>Signal Update Frequency</span>
                    <select style={{ background: '#1a1a1a', color: '#d4af37', padding: '4px 8px', borderRadius: '4px', border: '1px solid #d4af37' }}>
                      <option>Every 5 minutes</option>
                      <option>Every 15 minutes</option>
                      <option>Every 30 minutes</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center p-4" style={{ background: '#0f0f0f', borderRadius: '8px' }}>
                    <span style={{ color: '#999' }}>Max Leverage</span>
                    <input type="number" defaultValue="5" style={{ background: '#1a1a1a', color: '#d4af37', padding: '4px 8px', borderRadius: '4px', border: '1px solid #d4af37', width: '80px' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card style={{ background: '#1a1a1a', borderColor: '#d4af37', borderWidth: '2px' }}>
              <CardHeader>
                <CardTitle style={{ color: '#d4af37' }}>🔐 Security</CardTitle>
                <CardDescription>Security settings and audit logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert style={{ background: '#0f0f0f', borderColor: '#00ff88' }}>
                    <AlertCircle className="h-4 w-4" style={{ color: '#00ff88' }} />
                    <AlertDescription style={{ color: '#999' }}>
                      All API keys are encrypted and stored securely
                    </AlertDescription>
                  </Alert>
                  <div className="p-4" style={{ background: '#0f0f0f', borderRadius: '8px' }}>
                    <p style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '8px' }}>Recent Activity</p>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      <p>✓ Admin login - 5 minutes ago</p>
                      <p>✓ API keys rotated - 2 days ago</p>
                      <p>✓ Database backup - 1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
