"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie
} from "recharts";
import { formatMoney } from "@/lib/format";
import { useCurrency } from "@/lib/store";

interface StageData { stage: string; value: number; count: number; }

export function PipelineValueChart({ data }: { data: StageData[] }) {
  const currency = useCurrency();
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <XAxis dataKey="stage" stroke="#888" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          stroke="#888"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => formatMoney(v, currency)}
          axisLine={false}
          tickLine={false}
          width={65}
        />
        <Tooltip
          contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#aaa" }}
          formatter={(v: number) => [formatMoney(v, currency), "Value"]}
        />
        <Bar dataKey="value" fill="#38bdf8" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => {
            const colors = ["#60a5fa", "#fbbf24", "#34d399", "#f87171", "#a78bfa"];
            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface SupplierData { name: string; value: number; count: number; }

const DONUT_COLORS = ["#38bdf8", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];

export function SupplierDistributionDonut({ data }: { data: SupplierData[] }) {
  const currency = useCurrency();
  
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[150px] items-center justify-center text-sm text-neutral-500">
        No booking data available
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
      <ResponsiveContainer width={130} height={130} className="shrink-0">
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={35}
            outerRadius={55}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-1.5 w-full min-w-0">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
              <span className="text-neutral-300 truncate" title={d.name}>{d.name}</span>
            </div>
            <span className="text-white font-medium shrink-0 ml-2">{formatMoney(d.value, currency)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
