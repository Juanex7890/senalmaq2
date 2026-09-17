"use client";

import { ReactNode } from "react";

interface SectionHeaderProps {
  icon: ReactNode;
  iconClassName?: string;
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export default function SectionHeader({
  icon,
  iconClassName,
  title,
  subtitle,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
            iconClassName ?? "bg-green-100 text-green-700"
          }`}
        >
          {icon}
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="text-xs font-medium text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
