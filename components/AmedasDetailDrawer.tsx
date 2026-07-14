"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";

import TempChart from "@/components/TempChart";
import WeatherCards from "@/components/WeatherCards";
import type {
  AmedasHistoryPoint,
  AmedasPoint,
  AmedasRow,
} from "@/components/amedasTypes";

interface AmedasDetailDrawerProps {
  open: boolean;
  row: AmedasRow | null;
  point: AmedasPoint | null;
  history: AmedasHistoryPoint[];
  sheetSnap: string | number | null;
  onOpenChange: (open: boolean) => void;
  onSheetSnapChange: (value: string | number | null) => void;
}

export default function AmedasDetailDrawer({
  open,
  row,
  point,
  history,
  sheetSnap,
  onOpenChange,
  onSheetSnapChange,
}: AmedasDetailDrawerProps) {
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      direction={isPortrait ? "bottom" : "right"}
      modal={false}
      {...(isPortrait
        ? {
            snapPoints: ["120px", 0.55, 0.7],
            activeSnapPoint: sheetSnap,
            setActiveSnapPoint: onSheetSnapChange,
          }
        : {})}
    >
      <Drawer.Portal>
        <Drawer.Overlay style={{ background: "transparent", pointerEvents: "none" }} />
        <Drawer.Content
          style={{
            position: "fixed",
            ...(isPortrait
              ? {
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: "70vh",
                  borderRadius: "20px 20px 0 0",
                }
              : {
                  top: 0,
                  right: 0,
                  width: 520,
                  height: "100vh",
                  borderRadius: "20px 0 0 20px",
                }),
            background: "rgba(38,38,38,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            padding: 16,
            zIndex: 1300,
          }}
        >
          {isPortrait && (
            <Drawer.Handle style={{ margin: "8px auto 8px", touchAction: "none" }} />
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
              mb: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold", flex: 1 }}>
              {row?.name}
            </Typography>

            <IconButton onClick={() => onOpenChange(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {row?.prefecture}
            </Typography>

            <WeatherCards point={point} />
            <TempChart data={history} />
          </Box>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
