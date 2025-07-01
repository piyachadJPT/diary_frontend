"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ReactNode } from "react";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#5e35b1",
        },
        background: {
            default: "#f7f9f9",
        },
    },
    typography: {
        fontFamily: '"Noto Sans Thai", sans-serif',
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 600,
            lg: 1200,
            xl: 1536,
        },
    },
});

export default function ThemeRegistry({ children }: { children: ReactNode }) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}