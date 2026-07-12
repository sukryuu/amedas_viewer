"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridSortDirection } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import UnitText from "@/components/UnitText";
import HeaderText from "@/components/HeaderText";

interface AmedasRow {
  id: string;
  name: string;
  temp: number | null;
  humidity: number | null;
  wind: number | null;
  precipitation1h: number | null;
  snow: number | null;
}

const formatValue = (value: number | null) => {
  return value == null ? "-" : value;
};

const getNullLastComparator = (sortDirection: GridSortDirection) => {
  return (v1: number | null, v2: number | null) => {
    if (v1 == null && v2 == null) return 0;
    if (v1 == null) return 1;
    if (v2 == null) return -1;

    if (sortDirection === "desc") {
      return v2 - v1;
    }

    // asc または undefined
    return v1 - v2;
  };
};

const formatUpdateTime = (value: string | null) => {
  if (!value) return "-";

  return `${value.slice(0, 4)}/${value.slice(4, 6)}/${value.slice(6, 8)} ${
    value.slice(8, 10)
  }:${value.slice(10, 12)}`;
};

export default function Home() {
  const [rows, setRows] = useState<AmedasRow[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/amedas")
      .then((res) => res.json())
      .then((data) => {
        setRows(data.rows);
        setUpdatedAt(data.time);
      });
  }, []);

const windDirections = [
  "北",
  "北北東",
  "北東",
  "東北東",
  "東",
  "東南東",
  "南東",
  "南南東",
  "南",
  "南南西",
  "南西",
  "西南西",
  "西",
  "西北西",
  "北西",
  "北北西",
];

const getWindDirection = (value: number | null) => {
  if (value == null) return "-";

  return windDirections[(value - 1) % 16];
};

  const columns: GridColDef[] = [
    {
      field: "name",
      flex: 1.5,
      renderHeader: () => (
        <HeaderText>
          観測所
        </HeaderText>
      ),
      valueFormatter: (value) => formatValue(value),
      align: "center",
      headerAlign: "center",
    },

    {
      field: "temp",
      flex: 0.7,
      renderHeader: () => (
        <HeaderText>
          気温
        </HeaderText>
      ),
      renderCell: (params) => (
        <UnitText
          value={params.value ?? "-"}
          unit="℃"
        />
      ),
      getSortComparator: getNullLastComparator,
      align: "center",
      headerAlign: "center",
    },

    {
      field: "humidity",
      flex: 0.7,
      renderHeader: () => (
        <HeaderText>
          湿度
        </HeaderText>
      ),
      renderCell: (params) => (
        <UnitText
          value={params.value ?? "-"}
          unit="%"
        />
      ),
      getSortComparator: getNullLastComparator,
      align: "center",
      headerAlign: "center",
    },

    {
      field: "wind",
      flex: 0.9,
      renderHeader: () => (
        <HeaderText>
          風
        </HeaderText>
      ),
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            lineHeight: 1.2,
          }}
        >
          <UnitText
            value={params.row.wind ?? "-"}
            unit="m/s"
          />

          <Box
            sx={{
              fontSize: 12,
              color: "#aaa",
            }}
          >
            {getWindDirection(params.row.windDirection)}
          </Box>
        </Box>
      ),
      getSortComparator: getNullLastComparator,
      align: "center",
      headerAlign: "center",
    },

    {
      field: "precipitation1h",
      flex: 0.9,
      renderHeader: () => (
        <HeaderText>
          降水量
        </HeaderText>
      ),
      renderCell: (params) => (
        <UnitText
          value={params.value ?? "-"}
          unit="mm/h"
        />
      ),
      getSortComparator: getNullLastComparator,
      align: "center",
      headerAlign: "center",
    },

    {
      field: "snow",
      flex: 0.9,
      renderHeader: () => (
        <HeaderText>
          積雪深
        </HeaderText>
      ),
      renderCell: (params) => (
        <UnitText
          value={params.value ?? "-"}
          unit="cm"
        />
      ),
      getSortComparator: getNullLastComparator,
      align: "center",
      headerAlign: "center",
    },
  ];

  return (
    <main>
      <Box
        sx={{
          display: "flex",
          width: "90%",
          margin: "0 auto",
          alignItems: "center",
          gap: 2,
          marginTop: 2,
          marginBottom: 2,
        }}
      >
        <h1 className="text-xl font-bold">
          アメダスビューア
        </h1>

        <Box
          sx={{
            color: "#888",
            fontSize: 13,
          }}
        >
          最終更新: {formatUpdateTime(updatedAt)}
        </Box>
      </Box>

      <Box
        sx={{
          width: "90%",
          maxWidth: 1700,
          height: 700,
          margin: "0 auto",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={48}
          sx={{
            border: "none",

            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#222",
            },

            "& .MuiDataGrid-cell": {
              fontSize: 14,
            },
          }}
        />
      </Box>

    </main>
  );
}