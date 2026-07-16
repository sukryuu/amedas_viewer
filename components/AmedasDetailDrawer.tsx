"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Typography } from "@mui/material";
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
  const [isPortrait, setIsPortrait] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(orientation: portrait)");
    setIsPortrait(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!mounted) return null;

  if (!isPortrait) {
    // デスクトップ: 右側からスライド
    return (
      <Drawer.Root
        open={open}
        onOpenChange={onOpenChange}
        direction="right"
        modal={false}
      >
        <Drawer.Portal>
          <Drawer.Content
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: 520,
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              borderRadius: "20px 0 0 20px",
              background: "rgba(38,38,38,0.95)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              padding: 16,
              zIndex: 1300,
              outline: "none",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, mb: 2 }}>
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

  // モバイル: 下からスナップシート
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      direction="bottom"
      modal={true}
      snapPoints={["160px", 0.9]}
      activeSnapPoint={sheetSnap}
      setActiveSnapPoint={onSheetSnapChange}
      fadeFromIndex={0}
      scrollLockTimeout={100}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1299,
          }}
        />
        <Drawer.Content
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            borderRadius: "20px 20px 0 0",
            background: "rgba(38,38,38,0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 1300,
            outline: "none",
            overflow: "hidden",
          }}
        >
          {/* ハンドルエリア: ドラッグ専用 */}
          <div
            style={{
              padding: "12px 16px 0",
              flexShrink: 0,
              cursor: "grab",
            }}
          >
            <Drawer.Handle
              style={{
                display: "block",
                margin: "0 auto 12px",
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", flex: 1 }}>
                {row?.name}
              </Typography>
              <IconButton onClick={() => onOpenChange(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </div>

          {/* スクロール可能なコンテンツエリア */}
          <Box
            data-vaul-no-drag
            sx={{
              flex: 1,
              overflowY: sheetSnap === 0.9 ? "auto" : "hidden",
              minHeight: 0,
              px: 2,
              pb: 2,
            }}
          >
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
