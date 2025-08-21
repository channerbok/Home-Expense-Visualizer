"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo, useState } from "react";

interface CleanedExpense {
  postingdate: Date;
  indicator: string;
  category: string;
  reference: string;
  amount: number;
}

interface Props {
  data: CleanedExpense[];
  selectedMonth: string; // numeric string or "All"
  selectedYear: string;  // string or "All"
}

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#845EC2", "#D65DB1", "#6BFFB8", "#FF6F91", "#FF0000", "#FFA500"
];

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getTopCategories(categoryTotals: Record<string, number>, topN = 10) {
  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const otherTotal = sorted.slice(topN).reduce((sum, [, amt]) => sum + amt, 0);
  const topCategories = sorted.slice(0, topN);

  const result: Record<string, number> = {};
  topCategories.forEach(([cat, amt]) => { result[cat] = amt; });
  if (otherTotal > 0) result["Misc."] = otherTotal;
  return result;
}

// Helper function for currency formatting
const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface PieCenterLabelProps {
  cx: number;
  cy: number;
  total: number;
  xOffset?: number;
  yOffset?: number;
}

const PieCenterLabel = ({ cx, cy, total, xOffset = 0, yOffset = 0 }: PieCenterLabelProps) => (
  <text
    x="50%"
    y="45%"
    textAnchor="middle"
    dominantBaseline="middle"
    fontSize={22}
    fontWeight={600}
    fill="#333"
  >
    {formatCurrency(total)}
  </text>
);



export default function ExpenseVisualizer({ data, selectedMonth, selectedYear }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const categoryTotals = useMemo(() => {
    return data
      .filter(expense => expense.indicator.toLowerCase() === "debit")
      .reduce<Record<string, number>>((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {});
  }, [data]);

  const topCategoryTotals = getTopCategories(categoryTotals, 6);
  const chartData = Object.entries(topCategoryTotals).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
  }));

  const monthName = selectedMonth !== "All" ? MONTH_NAMES[Number(selectedMonth)] : "All Months";
  const totalSpent = chartData.reduce((sum, item) => sum + item.value, 0);

  const cx = 200;
  const cy = 200;

  return (
    <div
      style={{ marginTop: "1.5rem", height: 400, outline: "none", userSelect: "none" }}
      tabIndex={-1}
    >
      <p style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>
        Year: {selectedYear !== "All" ? selectedYear : "All Years"} - Month: {monthName}
      </p>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart tabIndex={-1} style={{ outline: "none" }}>
          <defs>
            {COLORS.map((color, i) => (
              <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color} stopOpacity={0.4} />
              </linearGradient>
            ))}
          </defs>

          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%" 
            cy="50%" 
            outerRadius={130}
            innerRadius={70}
            paddingAngle={2}
            isAnimationActive={true}
            animationDuration={1200}
            labelLine={true}
            label={({ value }) => formatCurrency(value)}
            tabIndex={-1}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {chartData.map((_, index) => {
              const baseColor = COLORS[index % COLORS.length];
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={activeIndex === index ? baseColor : `url(#grad-${index % COLORS.length})`}
                  style={{ outline: "none" }}
                />
              );
            })}
          </Pie>

          <PieCenterLabel cx={cx} cy={cy} total={totalSpent} yOffset={-2} />

          <Tooltip formatter={(value: number) => formatCurrency(value)} />

          <Legend 
            verticalAlign="bottom" 
            align="center" 
            wrapperStyle={{ marginBottom: 20, marginTop: 60 }}
          />
        </PieChart>
      </ResponsiveContainer>

      <style jsx global>{`
        svg:focus {
          outline: none !important;
        }
      `}</style>
    </div>
  );
}
