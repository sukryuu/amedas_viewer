import { Box } from "@mui/material";

export default function UnitText({
    value,
    unit,
}: {
    value: number | string;
    unit: string;
}) {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "baseline",
                gap: 0.5,
                width: "100%",
            }}
        >
            <Box
                sx={{
                    fontSize: 15,
                    fontWeight: "medium",
                }}
            >
                {value}
            </Box>

            <Box
                sx={{
                    fontSize: 11,
                    color: "#aaa",
                }}
            >
                {unit}
            </Box>
        </Box>
    );
}