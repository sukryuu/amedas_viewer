"use client";

import { Paper, Typography } from "@mui/material";
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AmedasHistoryPoint } from "@/components/amedasTypes";

interface TempTooltipPayload {
  value?: number | null;
}

interface TempTooltipProps {
  active?: boolean;
  payload?: TempTooltipPayload[];
  label?: string;
}

const TempTooltip = ({ active, payload, label }: TempTooltipProps) => {
  if (!active || !payload?.length || !label) {
    return null;
  }

  return (
    <Paper
      elevation={6}
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2,
        bgcolor: "#2b2b2b",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
        {`${label.slice(0, 4)}/${label.slice(4, 6)}/${label.slice(6, 8)} ${label.slice(
          8,
          10,
        )}:${label.slice(10, 12)}`}
      </Typography>

      <Typography sx={{ mt: 0.5, fontSize: 18, fontWeight: 700 }}>
        {payload[0].value?.toFixed(1)}℃
      </Typography>
    </Paper>
  );
};

export default function TempChart({ data }: { data: AmedasHistoryPoint[] }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 3,
        background: "#262626",
      }}
    >
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        気温の変化（24時間）
      </Typography>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff9800" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ff9800" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="time"
            ticks={data.filter((_, index) => index % 24 === 0).map((item) => item.time)}
            tickFormatter={(value) => `${value.slice(8, 10)}:${value.slice(10, 12)}`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#aaa", fontSize: 12 }}
          />
          <YAxis
            unit="℃"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#aaa", fontSize: 12 }}
          />
          <Tooltip
            content={<TempTooltip />}
            cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="temp"
            fill="url(#tempGradient)"
            stroke="none"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#ff9800"
            strokeWidth={3}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
