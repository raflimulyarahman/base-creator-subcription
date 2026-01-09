"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWallet } from "@/context/WalletContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BasedBox from "../../../../public/based.png";

export default function Page() {
  const { isConnected, address, role, isLoading } = useWallet();
  const router = useRouter();

  console.log(isConnected, address, role, isLoading);
  useEffect(() => {
    if (!isLoading && role) {
      // role sudah ada → login sukses → redirect ke dashboard
      router.push("/dashboard"); // ganti "/dashboard" sesuai halaman tujuan
    }
  }, [isLoading, role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md sm:max-w-lg p-6 sm:p-8 flex flex-col gap-6 bg-white rounded-2xl shadow-sm">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="font-mono text-xl sm:text-2xl font-bold text-gray-800">
              Sign In
            </h1>
            <p className="font-sans text-sm sm:text-lg text-gray-500">
              Connect your wallet to continue
            </p>
          </div>

          {/* Logo */}
          <div className="flex justify-center py-6 sm:py-8">
            <div className="bg-gray-200 rounded-xl shadow-inner p-3">
              <Image
                src={BasedBox}
                alt="Based Education"
                width={120}
                height={120}
                className="sm:w-[140px] sm:h-[140px]"
                priority
              />
            </div>
          </div>

          {/* Description */}
          <div className="text-center space-y-1 px-2 sm:px-4">
            <h2 className="font-mono text-sm sm:text-base font-semibold text-gray-700">
              Use your wallet to sign in and access the platform
            </h2>
            <p className="font-sans text-xs sm:text-sm text-gray-500">
              We use your wallet address for authentication. No private keys are
              stored.
            </p>
          </div>

          {/* Connect */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: { opacity: 0, pointerEvents: "none" },
                    })}
                    className="w-full"
                  >
                    {!connected && (
                      <button
                        onClick={openConnectModal}
                        className="w-full rounded-xl bg-gray-900 text-white py-3 font-mono font-semibold hover:bg-gray-800 transition"
                      >
                        Connect Wallet
                      </button>
                    )}

                    {connected && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={openChainModal}
                          className="px-3 py-2 rounded-lg bg-gray-200 text-sm w-full sm:w-auto"
                        >
                          {chain.name}
                        </button>

                        <button
                          onClick={openAccountModal}
                          className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm w-full sm:w-auto"
                        >
                          {account.displayName}
                        </button>
                      </div>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>

            {isConnected && (
              <p className="text-xs text-gray-500 break-all text-center">
                Connected as <span className="font-medium">{address}</span>
              </p>
            )}
          </div>

          {/* Status */}
          {isConnected && (
            <div className="text-center text-sm text-gray-600">
              {isLoading && (
                <span className="animate-pulse">Checking session...</span>
              )}
              {!isLoading && role === null && (
                <span className="animate-pulse">Awaiting signature...</span>
              )}
              {role && (
                <span className="text-green-600 font-medium">
                  Logged in as {role}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
