"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Container, Box } from "@mui/material";

interface AmedasRow {
  id: string;
  name: string;
  temp: number | null;
  humidity: number | null;
  wind: number | null;
  precipitation1h: number | null;
}

const formatValue = (value: number | null) => {
  return value == null ? "-" : value;
};

export default function Home() {
  const [rows, setRows] = useState<AmedasRow[]>([]);

  useEffect(() => {
    fetch("/api/amedas")
      .then((res) => res.json())
      .then((data) => {
        setRows(data.rows);
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
      headerName: "観測所",
      flex: 1,
      valueFormatter: (value) => formatValue(value),
      align: "center",
      headerAlign: "center",
    },
    {
      field: "temp",
      headerName: "気温(℃)",
      flex: 1,
      valueFormatter: (value) => formatValue(value),
      align: "center",
      headerAlign: "center",
    },
    {
      field: "humidity",
      headerName: "湿度(%)",
      flex: 1,
      valueFormatter: (value) => formatValue(value),
      align: "center",
      headerAlign: "center",
    },
    {
      field: "wind",
      headerName: "風",
      flex: 1,
      valueFormatter: (value) => formatValue(value),
      align: "center",
      headerAlign: "center",
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
      <Box
        sx={{
          fontSize: 14,
          fontWeight: "medium",
        }}
      >
        {params.row.wind ?? "-"}
        <Box
          component="span"
          sx={{
            fontSize: 12,
            color: "#b1b1b1",
            marginLeft: "2px",
          }}
        >
          m/s
        </Box>
      </Box>

          <Box
            sx={{
              fontSize: 12,
              color: "#b1b1b1",
            }}
          >
            {getWindDirection(params.row.windDirection)}
          </Box>
        </Box>
      ),
    },
    {
      field: "precipitation1h",
      headerName: "降水量(mm/h)",
      flex: 1,
      valueFormatter: (value) => formatValue(value),
      align: "center",
      headerAlign: "center",
    },
  ];

  return (
    <main>
      <h1 className="text-2xl m-10 text-center font-medium">
        アメダス観測ランキング
      </h1>

<Box
  sx={{
    width: "86%",
    maxWidth: 1000,
    height: 700,
    margin: "0 auto",
  }}
>
  <DataGrid
    rows={rows}
    columns={columns}
    rowHeight={60}
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