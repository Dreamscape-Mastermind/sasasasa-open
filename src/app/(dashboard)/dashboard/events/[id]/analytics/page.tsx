'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Overview } from '@/components/dashboard/overview';
import {
  BarChart2,
  Calendar,
  DollarSign,
  Download,
  TrendingUp,
  Users,
} from 'lucide-react';

const metrics = [
  {
    title: 'Total Revenue',
    value: '$45,231',
    change: '+20.1%',
    trend: 'up',
    description: 'Compared to last month',
  },
  {
    title: 'Ticket Sales',
    value: '1,234',
    change: '+15.3%',
    trend: 'up',
    description: 'Compared to last month',
  },
  {
    title: 'Active Events',
    value: '12',
    change: '+2',
    trend: 'up',
    description: 'New events this month',
  },
  {
    title: 'Attendees',
    value: '3,123',
    change: '+12.5%',
    trend: 'up',
    description: 'Compared to last month',
  },
];

const topEvents = [
  {
    name: 'Tech Conference 2025',
    sales: 450,
    revenue: 89999,
    conversion: 68,
  },
  {
    name: 'Music Festival',
    sales: 380,
    revenue: 75640,
    conversion: 64,
  },
  {
    name: 'Food & Wine Expo',
    sales: 290,
    revenue: 43200,
    conversion: 59,
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your event performance and metrics
          </p>
        </div>
        <div className="flex gap-4">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              {metric.title === 'Total Revenue' && (
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              )}
              {metric.title === 'Ticket Sales' && (
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              )}
              {metric.title === 'Active Events' && (
                <Calendar className="h-4 w-4 text-muted-foreground" />
              )}
              {metric.title === 'Attendees' && (
                <Users className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs">
                <span
                  className={`flex items-center ${
                    metric.trend === 'up'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metric.change}
                </span>
                <span className="text-muted-foreground ml-2">
                  {metric.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue from ticket sales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Overview />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Events</CardTitle>
          <CardDescription>
            Events with the highest ticket sales and revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-4 font-medium">Event Name</th>
                  <th className="pb-4 font-medium">Ticket Sales</th>
                  <th className="pb-4 font-medium">Revenue</th>
                  <th className="pb-4 font-medium">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {topEvents.map((event, index) => (
                  <tr key={event.name} className="border-t">
                    <td className="py-4">
                      <div className="font-medium">{event.name}</div>
                    </td>
                    <td className="py-4">{event.sales}</td>
                    <td className="py-4">${event.revenue.toLocaleString()}</td>
                    <td className="py-4">{event.conversion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}