"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CleanedExpense {
  postingdate: Date;
  indicator:string;
  category: string;
  reference: string;
  amount: number;
}

interface Props {
  data: CleanedExpense[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2", "#D65DB1"];

function getTopCategories(categoryTotals: Record<string,number>, topN = 10){
    const sorted = Object.entries(categoryTotals).sort((a,b) => b[1] - a[1]);
    const otherTotal = sorted.slice(topN).reduce((sum,[,amt]) => sum + amt, 0);
    const topCategories = sorted.slice(0,topN);

    const result: Record<string,number> = {};

    topCategories.forEach(([cat,amt]) => {
      result[cat] = amt;
    });
    if (otherTotal > 0){
      result["Other"] = otherTotal;
    }

    return result;
}

export default function ExpenseVisualizer({ data }: Props) {
  const categoryTotals = data.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const topCategoryTotals = getTopCategories(categoryTotals, 6);
  const chartData = Object.entries(topCategoryTotals).map(([name, value]) => ({
    name,
    value: Math.round(value*100)/100,
  }));

  return (
    <div style={{ marginTop: "2rem", height: 300 }}>
      <h2>Spending by Category</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            fill="#8884d8"
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
