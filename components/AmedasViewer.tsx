"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { Box, useMediaQuery } from "@mui/material";

import AmedasControls from "@/components/AmedasControls";
import AmedasDetailDrawer from "@/components/AmedasDetailDrawer";
import AmedasTable from "@/components/AmedasTable";
import { formatUpdateTime, sortRows } from "@/components/amedasHelpers";
import type {
  AmedasHistoryPoint,
  AmedasPoint,
  AmedasRow,
} from "@/components/amedasTypes";
import { useHydrated } from "@/components/useHydrated";
import { regions } from "@/lib/regions";

export default function AmedasViewer() {
  const [rows, setRows] = useState<AmedasRow[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [areaFilter, setAreaFilter] = useState("all");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedRow, setSelectedRow] = useState<AmedasRow | null>(null);
  const [pointData, setPointData] = useState<AmedasPoint | null>(null);
  const [history, setHistory] = useState<AmedasHistoryPoint[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [sheetSnap, setSheetSnap] = useState<string | number | null>(0.9);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [visibleFields, setVisibleFields] = useState([
    "temp",
    "humidity",
    "wind",
    "precipitation10m",
    "weather",
  ]);

  const hydrated = useHydrated();
  const isMobile = useMediaQuery("(max-width:600px)");
  const effectiveIsMobile = hydrated ? isMobile : false;

  useEffect(() => {
    const loadData = () => {
      const url = selectedTime
        ? `/api/amedas?time=${selectedTime}`
        : "/api/amedas";

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          startTransition(() => {
            setRows(data.rows ?? []);
            setUpdatedAt(data.time);
          });
        });
    };

    loadData();

    {
      /*}
    if (selectedTime || process.env.NEXT_PUBLIC_AMEDAS_TEST_TIME) {
      return;
    }

    const now = new Date();
    const nextUpdate = new Date(now);

    nextUpdate.setSeconds(0);
    nextUpdate.setMilliseconds(0);
    nextUpdate.setMinutes(Math.floor(now.getMinutes() / 10) * 10 + 10);

    const firstDelay = nextUpdate.getTime() - now.getTime();
    let interval: NodeJS.Timeout;

    const timeout = setTimeout(() => {
      loadData();

      interval = setInterval(loadData, 10 * 60 * 1000);
    }, firstDelay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
      */
    }
  }, [selectedTime]);

  const toggleField = (field: string) => {
    setVisibleFields((prev) =>
      prev.includes(field) ? prev.filter((x) => x !== field) : [...prev, field],
    );
  };

  const filteredRows = useMemo(() => {
    if (areaFilter === "all") return rows;

    return rows.filter((row) => {
      if (row.prefecture === areaFilter) return true;

      const prefectures: readonly string[] | undefined =
        regions[areaFilter as keyof typeof regions];

      return prefectures?.includes(String(row.prefecture));
    });
  }, [areaFilter, rows]);

  const sortedRows = useMemo(
    () => sortRows(filteredRows, sortField, sortAsc),
    [filteredRows, sortAsc, sortField],
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
      return;
    }

    setSortField(field);
    setSortAsc(true);
  };

  const openDetail = (row: AmedasRow) => {
    setSelectedRow(row);
    setPointData(null);
    setHistory([]);
    setSheetSnap("160px");
    setDetailOpen(true);

    if (!updatedAt) return;

    Promise.all([
      fetch(`/api/amedas/point?id=${row.id}&time=${updatedAt}`).then((res) =>
        res.json(),
      ),
      fetch(`/api/amedas/history?id=${row.id}&time=${updatedAt}`).then((res) =>
        res.json(),
      ),
    ])
      .then(([point, nextHistory]) => {
        setPointData(point);
        setHistory(nextHistory);
      })
      .catch((err) => {
        console.error("detail fetch failed", err);
      });
  };

  return (
    <main
      style={{
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "90%",
          margin: "0 auto",
          alignItems: "center",
          gap: 2,
          mt: 2,
          mb: 2,
        }}
      >
        <h1 className="text-lg font-bold md:text-2xl">アメダスビューア</h1>
        <Box sx={{ color: "#888", fontSize: { xs: 12, sm: 13, md: 14 } }}>
          最終更新: {formatUpdateTime(updatedAt)}
        </Box>
      </Box>

      <AmedasControls
        areaFilter={areaFilter}
        selectedTime={selectedTime}
        visibleFields={visibleFields}
        onAreaFilterChange={setAreaFilter}
        onSelectedTimeChange={setSelectedTime}
        onToggleField={toggleField}
      />

      <Box
        sx={{
          width: "90%",
          maxWidth: 1700,
          height: "calc(100vh - 150px)",
          margin: "0 auto",
        }}
      >
        <AmedasTable
          rows={sortedRows}
          visibleFields={visibleFields}
          isMobile={effectiveIsMobile}
          sortField={sortField}
          sortAsc={sortAsc}
          onSort={handleSort}
          onRowClick={openDetail}
        />
      </Box>

      <AmedasDetailDrawer
        open={detailOpen}
        row={selectedRow}
        point={pointData}
        history={history}
        sheetSnap={sheetSnap}
        onOpenChange={setDetailOpen}
        onSheetSnapChange={setSheetSnap}
      />
    </main>
  );
}
