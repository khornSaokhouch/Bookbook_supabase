import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

export function Avatar({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  return (
    <AvatarPrimitive.Root className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
      <AvatarPrimitive.Image src={src} alt={alt} className="h-full w-full object-cover" />
      <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center bg-gray-200">
        {alt?.charAt(0) ?? "?"}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
