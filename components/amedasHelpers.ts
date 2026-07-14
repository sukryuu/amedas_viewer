import type { AmedasRow } from "@/components/amedasTypes";

export const formatUpdateTime = (value: string | null) => {
  if (!value) return "-";

  return `${value.slice(0, 4)}/${value.slice(4, 6)}/${value.slice(6, 8)} ${value.slice(
    8,
    10,
  )}:${value.slice(10, 12)}`;
};

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

const weatherCodes: Record<number, string> = {
  0: "晴",
  1: "曇",
  2: "煙霧",
  3: "霧",
  4: "降水またはしゅう雨性の降水",
  5: "霧雨",
  6: "着氷性の霧雨",
  7: "雨",
  8: "着氷性の雨",
  9: "みぞれ",
  10: "雪",
  11: "凍雨",
  12: "霧雪",
  13: "しゅう雨または止み間のある雨",
  14: "しゅう雪または止み間のある雪",
  15: "ひょう",
  16: "雷",
};

export const getWeather = (value: number | null) => {
  if (value == null) return "-";

  return weatherCodes[value] ?? `不明(${value})`;
};

export const getWindDirection = (value: number | null) => {
  if (value == null) return "-";

  return windDirections[(value - 1) % 16] ?? "-";
};

export const getWindAngle = (dir: number | null) => {
  if (dir == null) return 0;

  return (dir - 1) * 22.5;
};

export const getTempBackground = (temp: number | null) => {
  if (temp == null) return "rgba(120,120,120,0.15)";

  const ratio = Math.max(0, Math.min(1, (temp + 10) / 45));
  const hue = 220 - ratio * 220;

  return `hsl(${hue}, 60%, 29%)`;
};

export const getRainBackground = (rain: number | null) => {
  if (rain == null) return "hsl(0,0%,29%)";
  if (rain < 1) return "hsl(200,45%,29%)";
  if (rain < 10) return "hsl(100,35%,29%)";
  if (rain < 30) return "hsl(50,50%,29%)";
  if (rain < 100) return "hsl(20,55%,29%)";

  return "hsl(290,45%,29%)";
};

export const buildTimeGroups = () => {
  const timeGroups = {
    "今日 午後": [] as string[],
    "今日 午前": [] as string[],
    "昨日": [] as string[],
  };

  const now = new Date();

  for (let i = 0; i < 144; i += 1) {
    const date = new Date();

    date.setMinutes(Math.floor(now.getMinutes() / 10) * 10, 0, 0);
    date.setMinutes(date.getMinutes() - i * 10);

    const time =
      date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, "0") +
      String(date.getDate()).padStart(2, "0") +
      String(date.getHours()).padStart(2, "0") +
      String(date.getMinutes()).padStart(2, "0") +
      "00";

    if (date.toDateString() === now.toDateString()) {
      if (date.getHours() >= 12) {
        timeGroups["今日 午後"].push(time);
      } else {
        timeGroups["今日 午前"].push(time);
      }
    } else {
      timeGroups["昨日"].push(time);
    }
  }

  return timeGroups;
};

export const sortRows = (
  rows: AmedasRow[],
  sortField: string | null,
  sortAsc: boolean,
) => {
  if (!sortField) return rows;

  return [...rows].sort((a, b) => {
    const av = a[sortField];
    const bv = b[sortField];

    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;

    const result =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));

    return sortAsc ? result : -result;
  });
};
