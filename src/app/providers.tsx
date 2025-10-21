// src/app/providers.tsx
"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/lib/theme";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    );
}