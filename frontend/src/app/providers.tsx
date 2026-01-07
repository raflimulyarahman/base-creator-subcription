"use client";

import { LightProvider } from "@/context/LightContext";
import { WalletProvider } from "@/context/WalletContext";

import { UsersProvider } from "@/context/UsersContext";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import ThemeWrapper from "./ThemeWrapper";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

const config = getDefaultConfig({
  appName: "Base Education",
  projectId,
  chains: [baseSepolia],
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LightProvider>
      <ThemeWrapper>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <WalletProvider>
                <UsersProvider>
                  {children}
                </UsersProvider>
              </WalletProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeWrapper>
    </LightProvider>
  );
}
