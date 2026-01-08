"use client";

import Image from "next/image";
import { useState } from "react";
import Based from "../../../public/based.png"; // ganti dengan path gambar kamu

export default function Loading() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
      {/* Skeleton loading */}
      {!isLoaded && (
        <div className="absolute w-full h-full bg-gray-300 animate-pulse rounded-full" />
      )}

      {/* Image */}
      <Image
        src={Based}
        alt="Avatar"
        fill
        priority
        className={`object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  );
}
