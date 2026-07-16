"use client";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";

interface AmedasDetailDrawerProps {
  open: boolean;
  sheetSnap: string | number | null;
  onOpenChange: (open: boolean) => void;
  onSheetSnapChange: (value: string | number | null) => void;
}

export default function AmedasDetailDrawer({
  open,
  sheetSnap,
  onOpenChange,
  onSheetSnapChange,
}: AmedasDetailDrawerProps) {
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null); // nullで未確定

  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    setIsPortrait(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // isPortraitが確定するまで何もレンダリングしない
  if (isPortrait === null) return null;

  if (!isPortrait) {
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
              display: "flex",
              flexDirection: "column",
              top: 0,
              right: 0,
              width: 520,
              height: "100vh",
              borderRadius: "20px 0 0 20px",
              background: "rgba(38,38,38,0.85)",
              padding: 16,
              zIndex: 1300,
            }}
          >
            <p style={{ color: "white" }}>テスト (デスクトップ)</p>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      direction="bottom"
      modal={true}
      snapPoints={["120px", 0.9]}
      activeSnapPoint={sheetSnap}
      setActiveSnapPoint={onSheetSnapChange}
      fadeFromIndex={0}
    >
      <Drawer.Portal>
        <Drawer.Content
          style={{
            position: "fixed",
            display: "flex",
            flexDirection: "column",
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: "96vh",
            borderRadius: "20px 20px 0 0",
            background: "rgba(38,38,38,0.85)",
            padding: 16,
            zIndex: 1300,
          }}
        >
          <Drawer.Handle />
          <p style={{ color: "white" }}>テスト (モバイル)</p>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
