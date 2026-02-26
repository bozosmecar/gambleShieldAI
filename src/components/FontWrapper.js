"use client";

import { useFont } from "@/context/FontContext";
import FontPicker from "./FontPicker";

export default function FontWrapper({ children }) {
  const { currentFont, isCormorant, fontWeight } = useFont();

  return (
    <div
      className={`${currentFont.font.className} ${isCormorant ? "text-[1.5rem] uppercase" : ""}`}
      style={{
        fontWeight,
        ...(isCormorant
          ? { WebkitTextStroke: "0.5px currentColor", letterSpacing: "0.02em" }
          : {}),
      }}
    >
      <FontPicker />
      {children}
    </div>
  );
}
