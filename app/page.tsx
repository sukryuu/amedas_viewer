"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridSortDirection, } from "@mui/x-data-grid";
import { Box, Button, Popover, Checkbox, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Typography, Paper, IconButton } from "@mui/material";

import UnitText from "@/components/UnitText";
import HeaderText from "@/components/HeaderText";
import { amedasFields } from "@/lib/amedasFields";

import { regions } from "@/lib/regions";
import { ListSubheader, Select, MenuItem, FormControl, SwipeableDrawer, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AmedasRow {
  id: string;
  name: string;
  [key: string]: any;
}

const getNullLastComparator = (sortDirection: GridSortDirection) => {
  return (v1: number | null, v2: number | null) => {
    if (v1 == null && v2 == null) return 0;
    if (v1 == null) return 1;
    if (v2 == null) return -1;

    return sortDirection === "desc"
      ? v2 - v1
      : v1 - v2;
  };
};

const formatUpdateTime = (value: string | null) => {
  if (!value) return "-";

  return `${value.slice(0, 4)}/${value.slice(4, 6)}/${value.slice(6, 8)} ${
    value.slice(8, 10)
  }:${value.slice(10, 12)}`;
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

const getWeather = (value: number | null) => {
    if (value == null) return "-";

    return weatherCodes[value] ?? `不明(${value})`;
};

const getWindDirection = (value: number | null) => {
  if (value == null) return "-";

  return windDirections[(value - 1) % 16];
};

const getWindAngle = (dir: number | null) => {
    if (dir == null) return 0;

    return (dir - 1) * 22.5;
};

const getTempColor = (temp: number | null) => {
  if (temp == null) return "transparent";

  if (temp < 5) return "#90caf9";
  if (temp < 15) return "#81d4fa";
  if (temp < 25) return "#fff59d";
  if (temp < 30) return "#ffcc80";

  return "#ef9a9a";
};


const getPrecipitationColor = (value: number | null) => {
  if (value == null) return "transparent";

  if (value === 0) return "#b3e5fc";
  if (value < 5) return "#81d4fa";
  if (value < 20) return "#a5d6a7";
  if (value < 50) return "#fff176";
  if (value < 100) return "#ff8a65";

  return "#ce93d8";
};

const WindArrow = ({ angle }: { angle: number }) => (
  <svg
    width="42"
    height="42"
    viewBox="4 2 34 38"
  >
    <g transform={`rotate(${angle} 21 21)`}>
      <path
        d="
          M21 4
          C19.8 4 18.8 4.7 18.2 6
          L9 27
          C8 29.5 10 31 12.2 30
          L21 25
          L29.8 30
          C32 31 34 29.5 33 27
          L23.8 6
          C23.2 4.7 22.2 4 21 4
          Z
        "
        fill="#fff"
        stroke="#fff"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

const ValueText = ({
  value,
  unit,
}: {
  value: number | null;
  unit: string;
}) => {

  if (value == null) {
    return (
      <Typography variant="h4">
        -
      </Typography>
    );
  }

  const [integer, decimal] =
    value.toFixed(1).split(".");

  return (
    <Box
      sx={{
        display:"flex",
        alignItems:"baseline",
        justifyContent:"center",
      }}
    >
      <Typography
        sx={{
          fontSize:42,
          fontWeight:700,
          lineHeight:1,
        }}
      >
        {integer}
      </Typography>

      <Typography
        sx={{
          fontSize:24,
          fontWeight:600,
        }}
      >
        .{decimal}
      </Typography>

      <Typography
        sx={{
          fontSize:14,
          ml:0.5,
          color:"text.secondary",
        }}
      >
        {unit}
      </Typography>
    </Box>
  );
};

export default function Home() {
  const [rows, setRows] = useState<AmedasRow[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [areaFilter, setAreaFilter] = useState("all");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [pointData, setPointData] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const [visibleFields, setVisibleFields] = useState([
    "temp",
    "humidity",
    "wind",
    "precipitation10m",
    "weather",
  ]);

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  useEffect(() => {
      const loadData = () => {
          const url = selectedTime
              ? `/api/amedas?time=${selectedTime}`
              : "/api/amedas";

          fetch(url)
              .then((res) => res.json())
              .then((data) => {
                  setRows(data.rows);
                  setUpdatedAt(data.time);
              });
      };

      loadData();

      if (selectedTime) {
          return;
      }

      if (process.env.NEXT_PUBLIC_AMEDAS_TEST_TIME) {
          return;
      }

      const now = new Date();

      const nextUpdate = new Date(now);

      nextUpdate.setSeconds(0);
      nextUpdate.setMilliseconds(0);

      nextUpdate.setMinutes(
          Math.floor(now.getMinutes() / 10) * 10 + 10
      );

      const firstDelay =
          nextUpdate.getTime() - now.getTime();

      let interval: NodeJS.Timeout;

      const timeout = setTimeout(() => {
          loadData();

          interval = setInterval(() => {
              loadData();
          }, 10 * 60 * 1000);

      }, firstDelay);

      return () => {
          clearTimeout(timeout);
          clearInterval(interval);
      };

  }, [selectedTime]);


  const toggleField = (field: string) => {
    setVisibleFields((prev) =>
      prev.includes(field)
        ? prev.filter((x) => x !== field)
        : [...prev, field]
    );
  };

  const filteredRows =
    areaFilter === "all"
        ? rows
        : rows.filter((row) => {
              if (row.prefecture === areaFilter) {
                  return true;
              }

              const prefectures: readonly string[] =
                  regions[areaFilter as keyof typeof regions];

              return prefectures?.includes(row.prefecture);
          });

const timeGroups = {
    "今日 午後": [] as string[],
    "今日 午前": [] as string[],
    "昨日": [] as string[],
};

const now = new Date();

for (let i = 0; i < 144; i++) {
    const date = new Date();

    date.setMinutes(
        Math.floor(now.getMinutes() / 10) * 10,
        0,
        0
    );

    date.setMinutes(
        date.getMinutes() - i * 10
    );

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

  const columns: GridColDef[] = [
    {
      field: "name",
      flex: 1.5,

      renderHeader: () => (
        <HeaderText>
          観測所
        </HeaderText>
      ),

      align: "center",
      headerAlign: "center",
    },


    ...amedasFields
      .filter((item) =>
        visibleFields.includes(item.field)
      )
      .map((item) => ({
        field: item.field,
        flex: 0.9,

        renderHeader: () => (
          <HeaderText>
            {item.name}
          </HeaderText>
        ),


        renderCell: (params: any) => {

        if (item.field === "weather") {
            return getWeather(params.value);
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
              <UnitText
                value={params.value ?? "-"}
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
          );
        }


          return (
            <UnitText
              value={params.value ?? "-"}
              unit={item.unit ?? ""}
            />
          );
        },


        getSortComparator:
          getNullLastComparator,

        align: "center" as const,
        headerAlign: "center" as const,
      })),
  ];

        const currentPoint = pointData;

        const isPortrait = useMediaQuery(
            "(orientation: portrait)"
        );

        const getTempBackground = (temp: number | null) => {
    if (temp == null) return "rgba(120,120,120,0.15)";

    const ratio = Math.max(
        0,
        Math.min(1, (temp + 10) / 45)
    );

    const hue = 220 - ratio * 220;

    return `hsl(${hue}, 60%, 29%)`;
};


const getRainBackground = (rain: number | null) => {
    if (rain == null) {
        return "hsl(0,0%,29%)";
    }

    if (rain < 1) {
        return "hsl(200,45%,29%)";
    }

    if (rain < 10) {
        return "hsl(100,35%,29%)";
    }

    if (rain < 30) {
        return "hsl(50,50%,29%)";
    }

    if (rain < 100) {
        return "hsl(20,55%,29%)";
    }

    return "hsl(290,45%,29%)";
};


const ValueCard = ({
    title,
    value,
    unit,
    background,
    
}: {
    title:string;
    value:number|null;
    unit:string;
    background?:string;
}) => {

    const display =
        value == null
            ? "-"
            : value.toFixed(1);


    const [integer, decimal] =
        display.split(".");


    return (
        <Paper
            variant="outlined"
            sx={{
                height:110,
                p:2,
                borderRadius:3,
                background: background ?? "#262626",
                display:"flex",
                flexDirection:"column",
                justifyContent:"center",
                alignItems:"center",
            }}
        >

            <Typography
                color="text.secondary"
                sx={{
                    fontSize:14,
                    mb:1,
                }}
            >
                {title}
            </Typography>


            <Box
                sx={{
                    display:"flex",
                    alignItems:"baseline",
                }}
            >

                <Typography
                    sx={{
                        fontSize:42,
                        fontWeight:500,
                        lineHeight:1,
                    }}
                >
                    {integer}
                </Typography>


                {decimal && (
                    <Typography
                        sx={{
                            fontSize:24,
                            fontWeight:600,
                        }}
                    >
                        .{decimal}
                    </Typography>
                )}


                <Typography
                    sx={{
                        fontSize:14,
                        ml:0.5,
                        color:"text.secondary",
                    }}
                >
                    {unit}
                </Typography>

            </Box>

        </Paper>
    );
};

const WindCard = ({ point }: { point:any }) => {

    const direction =
        point?.windDirection?.[0] ?? null;

    const speed =
        point?.wind?.[0] ?? null;

    const angle = getWindAngle(direction);


    return (
      <Paper
          variant="outlined"
          sx={{
              height:110,
              p:2,
              borderRadius:3,
              background:"#262626",
              display:"flex",
              alignItems:"center",
              gap:2,
          }}
      >

            <Box
                sx={{
                    width:44,
                    flexShrink:0,
                    display:"flex",
                    justifyContent:"center",
                }}
            >
                <WindArrow
                    angle={getWindAngle(
                        currentPoint?.windDirection?.[0] ?? null
                    )}
                />
            </Box>

            <Box
                sx={{
                    borderLeft:"1px solid rgba(255,255,255,0.3)",
                    pl:2,
                    minWidth:0,
                    whiteSpace:"nowrap",
                    display:"flex",
                    flex:1,
                    flexDirection:"column",
                    justifyContent:"center",
                    height:"70%",
                }}
            >

                <Box
                    sx={{
                        display:"flex",
                        gap:1,
                    }}
                >
                    <Typography
                        color="text.secondary"
                        sx={{
                            fontSize:"clamp(12px, 3vw, 14px)",
                        }}
                    >
                        風向
                    </Typography>

                    <Typography 
                        sx={{
                            fontWeight:700,
                            fontSize:"clamp(12px, 3vw, 14px)",
                        }}
                    >
                        {getWindDirection(direction)}
                    </Typography>
                </Box>


                <Divider sx={{my:0.5, borderColor:"rgba(255,255,255,0.25)"}}/>


                <Box
                    sx={{
                        display:"flex",
                        gap:1,
                    }}
                >
                  <Typography
                      color="text.secondary"
                      sx={{
                          fontSize:"clamp(5px, 3vw, 14px)",
                      }}
                  >
                      風速
                  </Typography>

                  <Typography
                      sx={{
                          fontWeight:700,
                          fontSize:"clamp(5px, 3vw, 14px)",
                      }}
                  >
                      {speed?.toFixed(1) ?? "-"}m/s
                  </Typography>
                </Box>

            </Box>

        </Paper>
    );
};

const TempChart = ({
    data,
}: {
    data:any[];
}) => (
    <Paper
        variant="outlined"
        sx={{
            mt:2,
            p:2,
            borderRadius:3,
            background:"#262626",
        }}
    >
        <Typography
            color="text.secondary"
            sx={{mb:1}}
        >
            気温の変化（24時間）
        </Typography>

        <ResponsiveContainer
            width="100%"
            height={250}
        >
            <LineChart data={data}>

                <XAxis
                    dataKey="time"
                    ticks={
                        data
                            .filter((_, index) => index % 24 === 0)
                            .map(item => item.time)
                    }
                    tickFormatter={(value) =>
                        `${value.slice(8,10)}:${value.slice(10,12)}`
                    }
                />

                <YAxis
                    unit="℃"
                />

                <Tooltip
                    labelFormatter={(value)=>
                        `${String(value).slice(8,10)}:${String(value).slice(10,12)}`
                    }
                />

                <Line
                    type="monotone"
                    dataKey="temp"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                />

            </LineChart>
        </ResponsiveContainer>
    </Paper>
);

  return (
    <main>

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
        <h1 className="text-xl font-bold">
          アメダスビューア
        </h1>
        <Box
          sx={{
            color:"#888",
            fontSize:13,
          }}
        >
          最終更新:
          {" "}
          {formatUpdateTime(updatedAt)}
        </Box>
      </Box>


      <Box
        sx={{
          width:"90%",
          margin:"0 auto",
          mb:2,
        }}
      >

        <Button
          variant="outlined"
          sx={{
            height:35,
          }}

          onClick={(e) =>
            setAnchorEl(e.currentTarget)
          }
        >
          表示項目
        </Button>

        <FormControl
            size="small"
            sx={{
                minWidth: 220,
                marginLeft: 2,
                "& .MuiOutlinedInput-root": {
                    height: 35,
                },
            }}
        >
            <InputLabel>地域</InputLabel>

            <Select
                label="地域"
                value={areaFilter}
                onChange={(e) =>
                    setAreaFilter(e.target.value)
                }
            >
                <MenuItem value="all">
                    すべて
                </MenuItem>

                {Object.entries(regions).map(
                    ([region, prefectures]) => (
                        [
                            <ListSubheader key={`${region}-header`}>
                                {region}
                            </ListSubheader>,

                            <MenuItem
                                key={region}
                                value={region}
                                sx={{
                                    fontWeight: "medium",
                                }}
                            >
                                {region}地方
                            </MenuItem>,

                            ...prefectures.map((pref) => (
                                <MenuItem
                                    key={pref}
                                    value={pref}
                                    sx={{
                                        pl: 4,
                                    }}
                                >
                                    {pref}
                                </MenuItem>
                            )),
                        ]
                    )
                )}
            </Select>
        </FormControl>

        <FormControl
            size="small"
            sx={{
                minWidth: 220,
                marginLeft: 2,
                marginTop: 0,
                "& .MuiOutlinedInput-root": {
                    height: 35,
                },
            }}
        >
            <InputLabel>
                観測時刻
            </InputLabel>

            <Select
                label="観測時刻"
                value={selectedTime}
                onChange={(e) =>
                    setSelectedTime(e.target.value)
                }
            >
                <MenuItem value="">
                    最新
                </MenuItem>

              {Object.entries(timeGroups).map(
                  ([group, times]) => [
                      <ListSubheader key={group}>
                          {group}
                      </ListSubheader>,

                      ...times.map((time) => (
                          <MenuItem
                              key={time}
                              value={time}
                          >
                              {time.slice(0,4)}/{time.slice(4,6)}/{time.slice(6,8)}
                              {" "}
                              {time.slice(8,10)}:{time.slice(10,12)}
                          </MenuItem>
                      )),
                  ]
              )}
            </Select>
        </FormControl>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical:"bottom",
            horizontal:"left",
          }}
        >

          <Box
            sx={{
              p:2,
              width:260,
            }}
          >

            {amedasFields.map((item) => (

              <Box
                key={item.field}
                sx={{
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"space-between",
                }}
              >

                <Box>
                  {item.name}
                </Box>


                <Checkbox
                  checked={
                    visibleFields.includes(item.field)
                  }
                  onChange={() =>
                    toggleField(item.field)
                  }
                />

              </Box>

            ))}

          </Box>

        </Popover>

      </Box>



      <Box
        sx={{
          width:"90%",
          maxWidth:1700,
          height:700,
          margin:"0 auto",
        }}
      >

        <DataGrid
          rows={filteredRows}
          columns={columns}
          rowHeight={48}

          sx={{
            border:"none",

            "& .MuiDataGrid-columnHeaders":{
              backgroundColor:"#222",
            },

            "& .MuiDataGrid-cell":{
              fontSize:14,
            },
          }}

          onRowClick={(params) => {
              setSelectedRow(params.row);

              Promise.all([
                  fetch(
                      `/api/amedas/point?id=${params.row.id}&time=${updatedAt}`
                  ).then(res => res.json()),

                  fetch(
                      `/api/amedas/history?id=${params.row.id}&time=${updatedAt}`
                  ).then(res => res.json())
              ])
              .then(([point, history]) => {
                  setPointData(point);
                  setHistory(history);
                  setDetailOpen(true);
              });
          }}
        />

          <SwipeableDrawer
              anchor={isPortrait ? "bottom" : "right"}
              open={detailOpen}
              onClose={() => setDetailOpen(false)}
              onOpen={() => setDetailOpen(true)}
              disableSwipeToOpen={!isPortrait}
              slotProps={{
                  paper: {
                      sx: {
                          width: isPortrait ? "100%" : 500,
                          height: isPortrait ? "55vh" : "100%",
                          borderRadius: isPortrait
                              ? "20px 20px 0 0"
                              : 0,
                          p: 2,
                      },
                  },
              }}
          >

            {isPortrait && (
                <Box
                    sx={{
                        width: 40,
                        height: 5,
                        borderRadius: 5,
                        backgroundColor: "grey.300",
                        mx: "auto",
                        mb: 2,
                    }}
                />
            )}

            <IconButton
                onClick={() => setDetailOpen(false)}
                sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                }}
            >
                <CloseIcon />
            </IconButton>

            <Typography
                variant="h5"
                sx={{
                    fontWeight: "bold",
                }}
            >
                {selectedRow?.name}
            </Typography>

            <Typography
                color="text.secondary"
                sx={{ mb: 3 }}
            >
                {selectedRow?.prefecture}
            </Typography>


            <Box
              sx={{
                display:"grid",
                gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
                gap:2,
              }}
            >

            <ValueCard
                title="気温"
                value={currentPoint?.temp?.[0] ?? null}
                unit="℃"
                background={
                    getTempBackground(
                        currentPoint?.temp?.[0] ?? null
                    )
                }
            />


            <ValueCard
                title="湿度"
                value={currentPoint?.humidity?.[0] ?? null}
                unit="%"
            />


            <WindCard point={currentPoint} />


            <ValueCard
                title="1時間降水量"
                value={
                    currentPoint?.precipitation1h?.[0] ?? null
                }
                unit="mm"
                background={
                    getRainBackground(
                        currentPoint?.precipitation1h?.[0] ?? null
                    )
                }
            />


            <ValueCard
                title="気圧"
                value={
                    currentPoint?.pressure?.[0] ?? null
                }
                unit="hPa"
            />


            </Box>

            <TempChart data={history}/>

        </SwipeableDrawer>

      </Box>

    </main>
  );
}