"use client";

import { useLight } from "@/context/LightContext";
import Image from "next/image";

interface HomeProps {
  activeTab?: string;
}

export default function Home({ activeTab = "Followed" }: HomeProps) {
  const { isDark } = useLight();

  return (
    <div className="w-full">
      {activeTab === "Followed" && <div className="p-4">Feed Followed</div>}
      {activeTab === "Trade" && <div className="p-4">Trade Feed</div>}
      {activeTab === "Talk" && <div className="p-4">Talk Feed</div>}
    </div>
  );
}
