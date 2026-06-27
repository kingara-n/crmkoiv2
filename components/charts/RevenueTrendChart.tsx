"use client";

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { formatMoney } from "@/lib/format";
import { useCurrency } from "@/lib/store";

interface Point { month: string; revenue: number; target: number; }

export function RevenueTrendChart({ data }: { data: Point[] }) {
  const currency = useCurrency();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="grad-rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="grad-tgt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
        <XAxis dataKey="month" stroke="#888" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          stroke="#888"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => formatMoney(v, currency)}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#aaa" }}
          formatter={(v: number) => formatMoney(v, currency)}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: "#aaa" }}
          formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
        />
        <Area type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={2} fill="url(#grad-rev)" />
        <Area type="monotone" dataKey="target" stroke="#22c55e" strokeWidth={2} fill="url(#grad-tgt)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
