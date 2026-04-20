import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  color: "red-400" | "blue-400" | "pink-400" | "yellow-300" | "green-400";
  className?: string;
  dim?: boolean;
}

const BG: Record<PanelProps["color"], string> = {
  "red-400": "bg-red-50   border-red-400",
  "blue-400": "bg-blue-50  border-blue-400",
  "pink-400": "bg-pink-50  border-pink-400",
  "yellow-300": "bg-yellow-50 border-yellow-300",
  "green-400": "bg-green-50 border-green-400",
};

export function Panel({
  children,
  color,
  className = "",
  dim = false,
}: PanelProps) {
  return (
    <div
      className={`
        rounded-2xl border-4 shadow-[0_4px_0_0_#000]
        px-3 py-3
        transition-all duration-300
        ${BG[color]}
        ${dim ? "opacity-50" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
