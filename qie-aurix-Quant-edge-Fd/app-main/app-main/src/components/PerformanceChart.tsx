import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { colors } from "../../tailwind.config";

const PerformanceChart = () => {
  const data = [
    { date: "2023-01-01", price: 100 },
    { date: "2023-01-02", price: 102 },
    { date: "2023-01-03", price: 101 },
    { date: "2023-01-04", price: 103 },
    { date: "2023-01-05", price: 104 },
    { date: "2023-01-06", price: 106 },
    { date: "2023-01-07", price: 107 },
    { date: "2023-01-08", price: 105 },
    { date: "2023-01-09", price: 104 },
    { date: "2023-01-10", price: 106 },
    { date: "2023-01-11", price: 108 },
    { date: "2023-01-12", price: 109 },
    { date: "2023-01-13", price: 111 },
    { date: "2023-01-14", price: 110 },
    { date: "2023-01-15", price: 112 },
    { date: "2023-01-16", price: 113 },
    { date: "2023-01-17", price: 114 },
    { date: "2023-01-18", price: 115 },
    { date: "2023-01-19", price: 116 },
    { date: "2023-01-20", price: 117 },
    { date: "2023-01-21", price: 118 },
    { date: "2023-01-22", price: 119 },
    { date: "2023-01-23", price: 120 },
    { date: "2023-01-24", price: 121 },
    { date: "2023-01-25", price: 122 },
    { date: "2023-01-26", price: 123 },
    { date: "2023-01-27", price: 124 },
    { date: "2023-01-28", price: 125 },
    { date: "2023-01-29", price: 126 },
    { date: "2023-01-30", price: 127 },
    { date: "2023-01-31", price: 128 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          labelStyle={{
            color: "black",
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="price" stroke={colors["primary-500"]} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;
