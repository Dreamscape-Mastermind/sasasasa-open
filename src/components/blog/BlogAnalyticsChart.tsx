"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  title: string;
  views: number;
  comments: number;
  reactions: number;
}

interface BlogAnalyticsChartProps {
  data: ChartData[];
}

export default function BlogAnalyticsChart({ data }: BlogAnalyticsChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="title" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="views" fill="#8884d8" name="Views" />
        <Bar dataKey="comments" fill="#82ca9d" name="Comments" />
        <Bar dataKey="reactions" fill="#ffc658" name="Reactions" />
      </BarChart>
    </ResponsiveContainer>
  );
}
