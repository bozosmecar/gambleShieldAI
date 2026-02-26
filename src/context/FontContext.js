"use client";

import { createContext, useContext, useState } from "react";
import {
  Cinzel_Decorative,
  Cormorant_Garamond,
  Libre_Baskerville,
} from "next/font/google";

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const FONT_OPTIONS = [
  {
    id: "cinzel",
    name: "Cinzel Decorative",
    font: cinzelDecorative,
    label: "Elegant serif",
  },
  {
    id: "palatino",
    name: "Libre Baskerville",
    font: libreBaskerville,
    label: "Roman serif",
  },
  {
    id: "cormorant",
    name: "Cormorant Garamond",
    font: cormorantGaramond,
    label: "Classic serif",
  },
];

const FontContext = createContext(null);

export function FontProvider({ children }) {
  const [selectedFont, setSelectedFont] = useState("cinzel");
  const [fontWeight, setFontWeight] = useState(700);

  const currentFont =
    FONT_OPTIONS.find((f) => f.id === selectedFont) || FONT_OPTIONS[0];
  const isCormorant = selectedFont === "cormorant";

  return (
    <FontContext.Provider
      value={{
        selectedFont,
        setSelectedFont,
        fontWeight,
        setFontWeight,
        currentFont,
        isCormorant,
      }}
    >
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const ctx = useContext(FontContext);
  if (!ctx) throw new Error("useFont must be used within FontProvider");
  return ctx;
}
