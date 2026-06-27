"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import { formatMoney } from "@/lib/format";
import { useCurrency } from "@/lib/store";

export function TeamRevenueChart({ data }: { data: { name: string; revenue: number; isTop?: boolean }[] }) {
  const currency = useCurrency();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
        <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          stroke="#888"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => formatMoney(v, currency)}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          cursor={{ fill: "#ffffff08" }}
          contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => formatMoney(v, currency)}
        />
        <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.isTop ? "#38bdf8" : "#3a3a3a"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
