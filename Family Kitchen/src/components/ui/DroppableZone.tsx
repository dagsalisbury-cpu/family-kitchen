"use client";

import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

export function DroppableZone({
  id,
  data,
  children,
  className,
  activeClassName,
}: {
  id: string;
  data?: any;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className || ""} ${isOver && activeClassName ? activeClassName : ""}`}
    >
      {children}
    </div>
  );
}
