import * as React from "react";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-lg border bg-white shadow-sm p-4 ${className}`}>{children}</div>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
