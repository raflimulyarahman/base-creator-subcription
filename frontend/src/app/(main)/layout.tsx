// app/(main)/layout.tsx
"use client";

import ClientShell from "@/app/client-shell";
import Providers from "@/app/providers";

export default function MainLayout({ children }) {
    return (
        <Providers>
            <ClientShell>{children} </ClientShell>
        </Providers>
    );
}
