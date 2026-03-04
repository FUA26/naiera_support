import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface ChartWrapperProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  accentColor?: "blue" | "green" | "orange" | "purple" | "pink" | "red" | "cyan" | "yellow";
}

const accentColors = {
  blue: "border-l-blue-500",
  green: "border-l-green-500",
  orange: "border-l-orange-500",
  purple: "border-l-purple-500",
  pink: "border-l-pink-500",
  red: "border-l-red-500",
  cyan: "border-l-cyan-500",
  yellow: "border-l-yellow-500",
};

const iconColors = {
  blue: "text-blue-500",
  green: "text-green-500",
  orange: "text-orange-500",
  purple: "text-purple-500",
  pink: "text-pink-500",
  red: "text-red-500",
  cyan: "text-cyan-500",
  yellow: "text-yellow-500",
};

export function ChartWrapper({
  title,
  icon: Icon,
  children,
  className,
  accentColor = "blue",
}: ChartWrapperProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-6 bg-card shadow-sm hover:shadow-md transition-shadow border-l-4",
        accentColors[accentColor],
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className={cn("w-5 h-5", iconColors[accentColor])} />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
