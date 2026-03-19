"use client";

import { createContext, useContext } from "react";

export const MapResetContext = createContext<(() => void) | null>(null);

export function useMapReset() {
  return useContext(MapResetContext);
}
