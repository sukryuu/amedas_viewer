import type { ReactNode } from "react";

export interface AmedasRow {
  id: string;
  name: string;
  prefecture?: string | null;
  [key: string]: string | number | null | undefined;
}

export interface AmedasColumn {
  field: string;
  label: string;
  unit?: string;
  renderCell?: (row: AmedasRow) => ReactNode;
}

export type AmedasPoint = Record<string, [number | null, number] | undefined>;

export interface AmedasHistoryPoint {
  time: string;
  temp: number | null;
  humidity: number | null;
  pressure: number | null;
}
