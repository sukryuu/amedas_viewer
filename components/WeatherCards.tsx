"use client";

import { Box, Divider, Paper, Typography } from "@mui/material";

import {
  getRainBackground,
  getTempBackground,
  getWindAngle,
  getWindDirection,
} from "@/components/amedasHelpers";
import type { AmedasPoint } from "@/components/amedasTypes";

const WindArrow = ({ angle }: { angle: number }) => (
  <svg width="42" height="42" viewBox="4 2 34 38" aria-hidden="true">
    <g transform={`rotate(${angle} 21 21)`}>
      <path
        d="M21 4 C19.8 4 18.8 4.7 18.2 6 L9 27 C8 29.5 10 31 12.2 30 L21 25 L29.8 30 C32 31 34 29.5 33 27 L23.8 6 C23.2 4.7 22.2 4 21 4 Z"
        fill="#fff"
        stroke="#fff"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

const ValueCard = ({
  title,
  value,
  unit,
  background,
}: {
  title: string;
  value: number | null;
  unit: string;
  background?: string;
}) => {
  const display = value == null ? "-" : value.toFixed(1);
  const [integer, decimal] = display.split(".");

  return (
    <Paper
      variant="outlined"
      sx={{
        height: 110,
        p: 2,
        borderRadius: 3,
        background: background ?? "#262626",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography color="text.secondary" sx={{ fontSize: 14, mb: 1 }}>
        {title}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "baseline" }}>
        <Typography sx={{ fontSize: 42, fontWeight: 500, lineHeight: 1 }}>
          {integer}
        </Typography>

        {decimal && (
          <Typography sx={{ fontSize: 24, fontWeight: 600 }}>
            .{decimal}
          </Typography>
        )}

        <Typography sx={{ fontSize: 14, ml: 0.5, color: "text.secondary" }}>
          {unit}
        </Typography>
      </Box>
    </Paper>
  );
};

const WindCard = ({ point }: { point: AmedasPoint | null }) => {
  const direction = point?.windDirection?.[0] ?? null;
  const speed = point?.wind?.[0] ?? null;

  return (
    <Paper
      variant="outlined"
      sx={{
        height: 110,
        p: 2,
        borderRadius: 3,
        background: "#262626",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box sx={{ width: 44, flexShrink: 0, display: "flex", justifyContent: "center" }}>
        <WindArrow angle={getWindAngle(direction)} />
      </Box>

      <Box
        sx={{
          borderLeft: "1px solid rgba(255,255,255,0.3)",
          pl: 2,
          minWidth: 0,
          whiteSpace: "nowrap",
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          height: "70%",
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <Typography color="text.secondary" sx={{ fontSize: "clamp(12px, 3vw, 14px)" }}>
            風向
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: "clamp(12px, 3vw, 14px)" }}>
            {getWindDirection(direction)}
          </Typography>
        </Box>

        <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.25)" }} />

        <Box sx={{ display: "flex", gap: 1 }}>
          <Typography color="text.secondary" sx={{ fontSize: "clamp(12px, 3vw, 14px)" }}>
            風速
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: "clamp(12px, 3vw, 14px)" }}>
            {speed?.toFixed(1) ?? "-"}m/s
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default function WeatherCards({ point }: { point: AmedasPoint | null }) {
  const temp = point?.temp?.[0] ?? null;
  const rain = point?.precipitation1h?.[0] ?? null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
        gap: 2,
      }}
    >
      <ValueCard
        title="気温"
        value={temp}
        unit="℃"
        background={getTempBackground(temp)}
      />
      <ValueCard title="湿度" value={point?.humidity?.[0] ?? null} unit="%" />
      <WindCard point={point} />
      <ValueCard
        title="視程"
        value={point?.visibility?.[0] != null ? point.visibility[0] / 1000 : null}
        unit="km"
      />
      <ValueCard
        title="1時間降水量"
        value={rain}
        unit="mm"
        background={getRainBackground(rain)}
      />
      <ValueCard title="気圧" value={point?.pressure?.[0] ?? null} unit="hPa" />
    </Box>
  );
}
