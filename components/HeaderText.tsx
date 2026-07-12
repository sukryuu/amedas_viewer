import { Box } from "@mui/material";

export default function HeaderText({
    children,
}: {
    children: string;
}) {
    return (
        <Box
            sx={{
                fontSize: 14,
                fontWeight: "bold",
            }}
        >
            {children}
        </Box>
    );
}