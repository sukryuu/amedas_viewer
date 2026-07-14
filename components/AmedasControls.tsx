"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Popover,
  Select,
} from "@mui/material";

import { buildTimeGroups } from "@/components/amedasHelpers";
import { amedasFields } from "@/lib/amedasFields";
import { regions } from "@/lib/regions";

interface AmedasControlsProps {
  areaFilter: string;
  selectedTime: string;
  visibleFields: string[];
  onAreaFilterChange: (value: string) => void;
  onSelectedTimeChange: (value: string) => void;
  onToggleField: (field: string) => void;
}

export default function AmedasControls({
  areaFilter,
  selectedTime,
  visibleFields,
  onAreaFilterChange,
  onSelectedTimeChange,
  onToggleField,
}: AmedasControlsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const timeGroups = useMemo(() => buildTimeGroups(), []);

  return (
    <Box
      sx={{
        width: "90%",
        margin: "0 auto",
        mb: 2,
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      <Button
        variant="outlined"
        sx={{ height: 35 }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        表示項目
      </Button>

      <FormControl
        size="small"
        sx={{
          minWidth: 220,
          marginLeft: { xs: 0, sm: 2 },
          "& .MuiOutlinedInput-root": { height: 35 },
        }}
      >
        <InputLabel>地域</InputLabel>
        <Select
          label="地域"
          value={areaFilter}
          onChange={(e) => onAreaFilterChange(e.target.value)}
        >
          <MenuItem value="all">すべて</MenuItem>

          {Object.entries(regions).map(([region, prefectures]) => [
            <ListSubheader key={`${region}-header`}>{region}</ListSubheader>,
            <MenuItem key={region} value={region} sx={{ fontWeight: "medium" }}>
              {region}地方
            </MenuItem>,
            ...prefectures.map((pref) => (
              <MenuItem key={pref} value={pref} sx={{ pl: 4 }}>
                {pref}
              </MenuItem>
            )),
          ])}
        </Select>
      </FormControl>

      <FormControl
        size="small"
        sx={{
          minWidth: { xs: "100%", sm: 220 },
          marginLeft: { xs: 0, sm: 2 },
          "& .MuiOutlinedInput-root": { height: 35 },
        }}
      >
        <InputLabel>観測時刻</InputLabel>
        <Select
          label="観測時刻"
          value={selectedTime}
          onChange={(e) => onSelectedTimeChange(e.target.value)}
        >
          <MenuItem value="">最新</MenuItem>

          {Object.entries(timeGroups).map(([group, times]) => [
            <ListSubheader key={group}>{group}</ListSubheader>,
            ...times.map((time) => (
              <MenuItem key={time} value={time}>
                {time.slice(0, 4)}/{time.slice(4, 6)}/{time.slice(6, 8)}{" "}
                {time.slice(8, 10)}:{time.slice(10, 12)}
              </MenuItem>
            )),
          ])}
        </Select>
      </FormControl>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 2, width: 260 }}>
          {amedasFields.map((item) => (
            <Box
              key={item.field}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>{item.name}</Box>
              <Checkbox
                checked={visibleFields.includes(item.field)}
                onChange={() => onToggleField(item.field)}
              />
            </Box>
          ))}
        </Box>
      </Popover>
    </Box>
  );
}
