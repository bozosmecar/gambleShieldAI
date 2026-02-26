"use client";

import { useFont, FONT_OPTIONS } from "@/context/FontContext";

export default function FontPicker() {
  const { selectedFont, setSelectedFont, fontWeight, setFontWeight } = useFont();

  return (
    <div className="fixed top-36 right-4 z-[100] flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200">
      <span className="text-xs font-medium text-gray-600 px-2">Font</span>
      {FONT_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => setSelectedFont(opt.id)}
          className={`px-3 py-1.5 rounded text-sm text-left transition-colors ${
            selectedFont === opt.id
              ? "bg-orange-500 text-white"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          title={opt.label}
        >
          {opt.name}
        </button>
      ))}
      <div className="border-t border-gray-300 mt-1 pt-1 px-2">
        <span className="text-xs font-medium text-gray-600">
          Weight: {fontWeight}
        </span>
        <input
          type="range"
          min={100}
          max={900}
          step={100}
          value={fontWeight}
          onChange={(e) => setFontWeight(Number(e.target.value))}
          className="w-full h-2 mt-1 accent-orange-500 cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-gray-400">
          <span>Thin</span>
          <span>Bold</span>
          <span>Black</span>
        </div>
      </div>
    </div>
  );
}
