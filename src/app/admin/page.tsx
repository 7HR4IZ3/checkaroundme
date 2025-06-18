"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDistanceToNow, subDays } from "date-fns";
import { Users, Building2, CreditCard, TrendingUp, Download } from "lucide-react";
import Loading from "@/components/ui/loading";

export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState<[Date | undefined, Date | undefined]>([
    subDays(new Date(), 30),
    new Date()
  ]);
  const [selectedView, setSelectedView] = useState("overview");
  
  // Fetch KPI data with date range
  const { data: stats, isLoading: statsLoading } = trpc.admin.getTransactionStats.useQuery({
    startDate: dateRange[0]?.toISOString(),
    endDate: dateRange[1]?.toISOString(),
  });
  const { data: businessStats } = trpc.admin.getBusinessStats.useQuery({});
  const { data: userStats } = trpc.admin.getUserStats.useQuery();
  const { data: revenueData } = trpc.admin.getRevenueData.useQuery({
    startDate: dateRange[0]?.toISOString(),
    endDate: dateRange[1]?.toISOString(),
  });
  
  // Fetch recent activity
  const { data: recentTransactions } = trpc.admin.listTransactions.useQuery({
    page: 1,
    limit: 5,
  });
  const { data: recentBusinesses } = trpc.admin.listBusinesses.useQuery({
    page: 1,
    limit: 5,
  });
  const { data: recentSubscribers } = trpc.admin.listSubscriptions.useQuery({
    page: 1,
    limit: 5,
  });

  if (statsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your business performance and analytics
          </p>
        </div>
        <div className="flex items-center gap-4 self-stretch sm:self-auto">
          <CalendarDateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
          />
          <Button variant="outline" className="ml-auto h-full">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* View Selector Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Grid - Remove shadow by adding shadow-none */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-none border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{userStats?.newUsers || 0} this week
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-none border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{businessStats?.totalCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {businessStats?.verifiedCount || 0} verified
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-none border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦{((stats?.totalAmount || 0) / 100).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.successful || 0} successful transactions
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-none border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.pending || 0} pending renewals
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart - Refined styling */}
          <Card className="shadow-none border-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Revenue Over Time</CardTitle>
              <Select defaultValue="daily">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity Grid - Refined styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-none border-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">View all</span>
                  •••
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions?.data.map((transaction) => (
                    <div key={transaction.$id} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium">₦{(transaction.amount / 100).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge className="ml-auto" variant={transaction.status === 'succeeded' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Businesses</CardTitle>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">View all</span>
                  •••
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBusinesses?.data.map((business) => (
                    <div key={business.$id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={business.imageUrl} alt={business.name} />
                        <AvatarFallback>{business.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium">{business.name}</p>
                        <p className="text-xs text-muted-foreground">{business.category}</p>
                      </div>
                      <Badge className="ml-auto" variant={business.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                        {business.verificationStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Subscribers</CardTitle>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">View all</span>
                  •••
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSubscribers?.map((subscription) => (
                    <div key={subscription.id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={subscription.customer?.email} alt={subscription.customer?.email} />
                        <AvatarFallback>{subscription.customer?.email[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium">{subscription.customer?.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(subscription.start), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge className="ml-auto" variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                        {subscription.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          {/* Add your analytics content here */}
        </TabsContent>

        <TabsContent value="reports">
          {/* Add your reports content here */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
