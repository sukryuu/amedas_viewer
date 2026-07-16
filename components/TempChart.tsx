"use client";

import { Box, Paper, Typography } from "@mui/material";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AmedasHistoryPoint } from "@/components/amedasTypes";

interface TempTooltipPayload {
  value?: number | null;
  dataKey?: string;
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

  const tempPayload = payload.find((p) => p.dataKey === "temp");
  const humPayload = payload.find((p) => p.dataKey === "humidity");
  const pressPayload = payload.find((p) => p.dataKey === "pressure");

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

      <Box sx={{ mt: 0.5, display: "flex", gap: 2, alignItems: "baseline" }}>
        {tempPayload && tempPayload.value != null && (
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#ff9800" }}>
            {tempPayload.value.toFixed(1)}℃
          </Typography>
        )}
        {humPayload && humPayload.value != null && (
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#2196f3" }}>
            {humPayload.value.toFixed(0)}%
          </Typography>
        )}
        {pressPayload && pressPayload.value != null && (
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#4caf50" }}>
            {pressPayload.value.toFixed(1)}hPa
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default function TempChart({ data }: { data: AmedasHistoryPoint[] }) {
  const hasPressure = data.some((d) => d.pressure != null);

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
        {hasPressure ? "気温・湿度・気圧の変化（24時間）" : "気温・湿度の変化（24時間）"}
      </Typography>

      <ResponsiveContainer width="100%" height={250} style={{ outline: "none" }}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} style={{ outline: "none" }}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff9800" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ff9800" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2196f3" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#2196f3" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4caf50" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#4caf50" stopOpacity={0} />
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
            yAxisId="left"
            unit="℃"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#aaa", fontSize: 12 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            unit="%"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#aaa", fontSize: 12 }}
            domain={[0, 100]}
          />
          {hasPressure && (
            <YAxis
              yAxisId="pressure"
              orientation="right"
              unit="hPa"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#aaa", fontSize: 12 }}
              domain={["dataMin - 2", "dataMax + 2"]}
            />
          )}
          <Tooltip
            content={<TempTooltip />}
            cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="temp"
            fill="url(#tempGradient)"
            stroke="none"
            isAnimationActive={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temp"
            stroke="#ff9800"
            strokeWidth={3}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="humidity"
            fill="url(#humidityGradient)"
            stroke="none"
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="humidity"
            stroke="#2196f3"
            strokeWidth={3}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
          {hasPressure && (
            <>
              <Area
                yAxisId="pressure"
                type="monotone"
                dataKey="pressure"
                fill="url(#pressureGradient)"
                stroke="none"
                isAnimationActive={false}
              />
              <Line
                yAxisId="pressure"
                type="monotone"
                dataKey="pressure"
                stroke="#4caf50"
                strokeWidth={3}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
}
