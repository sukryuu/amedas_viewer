"use client";

import { useSyncExternalStore } from "react";

const subscribe = (onStoreChange: () => void) => {
  const id = window.setTimeout(onStoreChange, 0);

  return () => window.clearTimeout(id);
};

const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export const useHydrated = () =>
  useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
