"use client";

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";

export function ConversionLineChart({ data }: { data: { month: string; rate: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
        <XAxis dataKey="month" stroke="#888" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          stroke="#888"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `${v}%`}
          axisLine={false}
          tickLine={false}
          width={45}
        />
        <Tooltip
          contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => `${v}%`}
        />
        <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const DONUT_COLORS = ["#38bdf8", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

export function LeadSourceDonut({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            stroke="#111"
          >
            {data.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
              <span className="text-neutral-300">{d.name}</span>
            </div>
            <span className="text-white font-medium">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
