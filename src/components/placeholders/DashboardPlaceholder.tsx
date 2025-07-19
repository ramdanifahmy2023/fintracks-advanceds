import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatabaseTest } from '@/components/DatabaseTest';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Store,
  Activity,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';

export const DashboardPlaceholder = () => {
  const { user, userRole } = useAuth();

  const stats = [
    {
      title: 'Total Revenue',
      value: 'Rp 125.5M',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-success',
    },
    {
      title: 'Total Orders',
      value: '2,847',
      change: '+8.2%',
      icon: ShoppingCart,
      color: 'text-primary',
    },
    {
      title: 'Active Products',
      value: '456',
      change: '+3.1%',
      icon: Package,
      color: 'text-warning',
    },
    {
      title: 'Active Stores',
      value: '12',
      change: '+2',
      icon: Store,
      color: 'text-info',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-hero rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-white/80 mb-4">
              Here's what's happening with your marketplace analytics today.
            </p>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {userRole?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
          <div className="hidden md:block">
            <BarChart3 className="h-24 w-24 text-white/30" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates and activities in your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                'New sales data uploaded for Tokopedia',
                'Product catalog updated with 23 new items',
                'Monthly report generated successfully',
                'User permissions updated for 2 team members',
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <p className="text-sm text-muted-foreground">{activity}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Activities
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts based on your role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userRole === 'super_admin' || userRole === 'admin' ? (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Upload Sales Data
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Add Manual Transaction
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Performance Summary
                </Button>
              </>
            )}
            <Button className="w-full justify-start" variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Development Notice */}
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Dashboard Under Development</h3>
                <p className="text-muted-foreground mt-2">
                  This is Phase 1 of the Hiban Analytics platform. Full dashboard functionality
                  including charts, detailed analytics, and real-time data will be implemented in the next phases.
                </p>
              </div>
              <Badge variant="outline" className="mt-4">
                Phase 1: Foundation Complete ✓
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Database Connection Test */}
        <div className="flex items-center justify-center">
          <DatabaseTest />
        </div>
      </div>
    </div>
  );
};