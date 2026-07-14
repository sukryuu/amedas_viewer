import { Box } from "@mui/material";
import type { ReactNode } from "react";

export default function HeaderText({
    children,
}: {
    children: ReactNode;
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
