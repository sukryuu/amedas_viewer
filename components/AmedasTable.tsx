"use client";

import { Box } from "@mui/material";
import { List, type ListProps } from "react-window";

import HeaderText from "@/components/HeaderText";
import UnitText from "@/components/UnitText";
import { getWeather, getWindDirection } from "@/components/amedasHelpers";
import type { AmedasColumn, AmedasRow } from "@/components/amedasTypes";
import { amedasFields } from "@/lib/amedasFields";

interface AmedasTableProps {
  rows: AmedasRow[];
  visibleFields: string[];
  isMobile: boolean;
  sortField: string | null;
  sortAsc: boolean;
  onSort: (field: string) => void;
  onRowClick: (row: AmedasRow) => void;
}

interface AmedasTableRowProps {
  rows: AmedasRow[];
  columns: AmedasColumn[];
  columnTemplate: string;
  isMobile: boolean;
  onRowClick: (row: AmedasRow) => void;
}

const RowRenderer: ListProps<AmedasTableRowProps>["rowComponent"] = ({
  ariaAttributes,
  index,
  style,
  rows,
  columns,
  columnTemplate,
  isMobile,
  onRowClick,
}) => {
  const row = rows[index];

  if (!row) return null;

  return (
    <div
      {...ariaAttributes}
      style={{
        ...style,
        display: "grid",
        gridTemplateColumns: columnTemplate,
        width: "100%",
        minWidth: isMobile ? "900px" : undefined,
        cursor: "pointer",
      }}
      onClick={() => onRowClick(row)}
    >
      {columns.map((col) => (
        <div
          key={col.field}
          style={{
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...(isMobile && col.field === "name"
              ? {
                  position: "sticky",
                  left: 0,
                  zIndex: 3,
                  background: "#121212",
                }
              : {}),
          }}
        >
          {col.renderCell ? col.renderCell(row) : row[col.field]}
        </div>
      ))}
    </div>
  );
};

export default function AmedasTable({
  rows,
  visibleFields,
  isMobile,
  sortField,
  sortAsc,
  onSort,
  onRowClick,
}: AmedasTableProps) {
  const columns: AmedasColumn[] = [
    {
      field: "name",
      label: "観測所",
      renderCell: (row) => row.name,
    },
    ...amedasFields
      .filter((item) => visibleFields.includes(item.field))
      .map((item) => ({
        field: item.field,
        label: item.name,
        unit: item.unit,
        renderCell: (row: AmedasRow) => {
          const value = row[item.field];

          if (item.field === "weather") {
            return getWeather(typeof value === "number" ? value : null);
          }

          if (item.field === "wind") {
            return (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  lineHeight: 1.2,
                }}
              >
                <UnitText value={value ?? "-"} unit="m/s" />
                <Box sx={{ fontSize: 12, color: "#aaa" }}>
                  {getWindDirection(
                    typeof row.windDirection === "number" ? row.windDirection : null,
                  )}
                </Box>
              </Box>
            );
          }

          return <UnitText value={value ?? "-"} unit={item.unit ?? ""} />;
        },
      })),
  ];

  const columnTemplate = isMobile
    ? columns.map((col) => (col.field === "name" ? "180px" : "110px")).join(" ")
    : columns.map(() => "1fr").join(" ");

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        overflowX: isMobile ? "auto" : "hidden",
        overflowY: "hidden",
      }}
    >
      <Box sx={{ height: "100%", minWidth: isMobile ? "900px" : "100%" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: columnTemplate,
            width: "100%",
            height: 48,
            background: "#222",
          }}
        >
          {columns.map((col) => (
            <button
              key={col.field}
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                border: 0,
                padding: 0,
                color: "inherit",
                background: "transparent",
                cursor: "pointer",
                ...(isMobile && col.field === "name"
                  ? {
                      left: 0,
                      zIndex: 4,
                      background: "#222",
                    }
                  : {}),
              }}
              onClick={() => onSort(col.field)}
            >
              <HeaderText>
                {col.label}
                {sortField === col.field ? (sortAsc ? " ▲" : " ▼") : ""}
              </HeaderText>
            </button>
          ))}
        </div>

        <List<AmedasTableRowProps>
          defaultHeight={600}
          rowCount={rows.length}
          rowHeight={48}
          rowProps={{
            rows,
            columns,
            columnTemplate,
            isMobile,
            onRowClick,
          }}
          style={{ width: "100%", height: "calc(100% - 48px)" }}
          rowComponent={RowRenderer}
        />
      </Box>
    </Box>
  );
}
