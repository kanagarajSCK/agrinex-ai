"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const forecastData = [
  { day: "Today", high: 31, low: 23, rain: 42 },
  { day: "Tue", high: 30, low: 22, rain: 35 },
  { day: "Wed", high: 32, low: 23, rain: 18 },
  { day: "Thu", high: 31, low: 22, rain: 52 },
  { day: "Fri", high: 29, low: 22, rain: 68 },
  { day: "Sat", high: 30, low: 21, rain: 38 },
  { day: "Sun", high: 31, low: 22, rain: 24 },
];

const marketData = [
  { day: "Mon", salem: 2380, erode: 2310, namakkal: 2260 },
  { day: "Tue", salem: 2410, erode: 2350, namakkal: 2290 },
  { day: "Wed", salem: 2360, erode: 2320, namakkal: 2310 },
  { day: "Thu", salem: 2460, erode: 2370, namakkal: 2330 },
  { day: "Fri", salem: 2440, erode: 2410, namakkal: 2360 },
  { day: "Sat", salem: 2490, erode: 2430, namakkal: 2390 },
  { day: "Sun", salem: 2450, erode: 2400, namakkal: 2370 },
];

const tooltipStyle = {
  border: "1px solid #e0e9e3",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "0 8px 24px rgba(16,28,24,0.08)",
};

export type WeatherChartPoint = { day: string; high: number; low: number; rain: number };

export function TemperatureChart({
  compact = false,
  data,
}: {
  compact?: boolean;
  data?: WeatherChartPoint[];
}) {
  const chartData = data ?? forecastData;
  return (
    <div className="h-[210px] w-full min-w-0 sm:h-[238px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 300, height: compact ? 210 : 238 }}>
        <AreaChart data={chartData} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="high-temp-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#17834D" stopOpacity={0.19} />
              <stop offset="100%" stopColor="#17834D" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="low-temp-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#76b8ce" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#76b8ce" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#edf2ee" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#829087", fontSize: 10 }} />
          <YAxis hide={!compact} domain={[18, 36]} tick={{ fill: "#829087", fontSize: 10 }} axisLine={false} tickLine={false} unit="°" />
          <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value}°C`, name === "high" ? (data ? "High" : "High · demo") : (data ? "Low" : "Low · demo")]} />
          <Area type="monotone" dataKey="high" name="high" stroke="#17834D" strokeWidth={2.5} fill="url(#high-temp-fill)" />
          <Area type="monotone" dataKey="low" name="low" stroke="#79aabd" strokeWidth={2} fill="url(#low-temp-fill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RainfallChart({ data }: { data?: WeatherChartPoint[] }) {
  const chartData = data ?? forecastData;
  return (
    <div className="h-[210px] w-full min-w-0 sm:h-[238px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 300, height: 210 }}>
        <BarChart data={chartData} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#edf2ee" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#829087", fontSize: 10 }} />
          <YAxis domain={[0, 100]} tickFormatter={(value: number) => `${value}%`} tick={{ fill: "#829087", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, data ? "Rain probability" : "Rain probability · demo"]} />
          <Bar dataKey="rain" name="Rain probability" fill="#6ba6c6" radius={[5, 5, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MarketTrendChart({ commodity = "Tomato" }: { commodity?: string }) {
  return (
    <div className="h-[236px] w-full min-w-0 sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 300, height: 260 }}>
        <LineChart data={marketData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#edf2ee" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#829087", fontSize: 10 }} />
          <YAxis domain={[2100, 2600]} tickFormatter={(value: number) => `₹${value}`} tick={{ fill: "#829087", fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`₹${value}/qtl`, `${name} · ${commodity} demo`]} />
          <Line type="monotone" dataKey="salem" name="Salem" stroke="#17834D" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="erode" name="Erode" stroke="#77a6c1" strokeWidth={2} dot={{ r: 2 }} />
          <Line type="monotone" dataKey="namakkal" name="Namakkal" stroke="#d3a548" strokeWidth={2} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MarketComparisonChart({
  data,
}: {
  data: Array<{ market: string; modal: number }>;
}) {
  if (!data.length) return null;
  return (
    <div className="h-[236px] w-full min-w-0 sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 300, height: 260 }}>
        <BarChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#edf2ee" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="market" axisLine={false} tickLine={false} tick={{ fill: "#829087", fontSize: 10 }} />
          <YAxis tickFormatter={(value: number) => `₹${value}`} tick={{ fill: "#829087", fontSize: 10 }} axisLine={false} tickLine={false} width={62} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`₹${value}/quintal`, "Reported modal price"]} />
          <Bar dataKey="modal" name="Modal price" fill="#17834D" radius={[5, 5, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
