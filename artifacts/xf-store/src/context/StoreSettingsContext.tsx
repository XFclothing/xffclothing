import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface StoreSettings {
  comingSoon: boolean;
  outOfStock: string[];
}

interface StoreSettingsContextValue extends StoreSettings {
  setComingSoon: (value: boolean) => Promise<void>;
  toggleOutOfStock: (productId: string) => Promise<void>;
  toggleOutOfStockColor: (productId: string, colorName: string) => Promise<void>;
  toggleOutOfStockSize: (productId: string, size: string) => Promise<void>;
  toggleOutOfStockColorSize: (productId: string, colorName: string, size: string) => Promise<void>;
  isColorOutOfStock: (productId: string, colorName: string) => boolean;
  isSizeOutOfStock: (productId: string, size: string) => boolean;
  isColorSizeOutOfStock: (productId: string, colorName: string, size: string) => boolean;
  loaded: boolean;
}

const defaultSettings: StoreSettings = { comingSoon: false, outOfStock: [] };

const StoreSettingsContext = createContext<StoreSettingsContextValue>({
  ...defaultSettings,
  setComingSoon: async () => {},
  toggleOutOfStock: async () => {},
  toggleOutOfStockColor: async () => {},
  toggleOutOfStockSize: async () => {},
  toggleOutOfStockColorSize: async () => {},
  isColorOutOfStock: () => false,
  isSizeOutOfStock: () => false,
  isColorSizeOutOfStock: () => false,
  loaded: false,
});

export function StoreSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from("store_settings")
          .select("value")
          .eq("key", "shop")
          .single();

        if (!error && data?.value) {
          setSettings({
            comingSoon: data.value.coming_soon ?? false,
            outOfStock: data.value.out_of_stock ?? [],
          });
        }
      } catch {
        // table may not exist yet — use defaults
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  const save = useCallback(async (next: StoreSettings) => {
    setSettings(next);
    try {
      await supabase.from("store_settings").upsert({
        key: "shop",
        value: { coming_soon: next.comingSoon, out_of_stock: next.outOfStock },
      });
    } catch {
      // silently ignore if table doesn't exist yet
    }
  }, []);

  const setComingSoon = useCallback(async (value: boolean) => {
    await save({ ...settings, comingSoon: value });
  }, [settings, save]);

  const toggleOutOfStock = useCallback(async (productId: string) => {
    const current = settings.outOfStock;
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    await save({ ...settings, outOfStock: next });
  }, [settings, save]);

  const toggleOutOfStockColor = useCallback(async (productId: string, colorName: string) => {
    const key = `${productId}:${colorName}`;
    const current = settings.outOfStock;
    const next = current.includes(key)
      ? current.filter((id) => id !== key)
      : [...current, key];
    await save({ ...settings, outOfStock: next });
  }, [settings, save]);

  const toggleOutOfStockSize = useCallback(async (productId: string, size: string) => {
    const key = `${productId}:size:${size}`;
    const current = settings.outOfStock;
    const next = current.includes(key)
      ? current.filter((id) => id !== key)
      : [...current, key];
    await save({ ...settings, outOfStock: next });
  }, [settings, save]);

  const toggleOutOfStockColorSize = useCallback(async (productId: string, colorName: string, size: string) => {
    const key = `${productId}:${colorName}:size:${size}`;
    const current = settings.outOfStock;
    const next = current.includes(key)
      ? current.filter((id) => id !== key)
      : [...current, key];
    await save({ ...settings, outOfStock: next });
  }, [settings, save]);

  const isColorOutOfStock = useCallback((productId: string, colorName: string) => {
    return settings.outOfStock.includes(`${productId}:${colorName}`);
  }, [settings.outOfStock]);

  const isSizeOutOfStock = useCallback((productId: string, size: string) => {
    return settings.outOfStock.includes(`${productId}:size:${size}`);
  }, [settings.outOfStock]);

  const isColorSizeOutOfStock = useCallback((productId: string, colorName: string, size: string) => {
    return settings.outOfStock.includes(`${productId}:${colorName}:size:${size}`);
  }, [settings.outOfStock]);

  return (
    <StoreSettingsContext.Provider value={{
      ...settings,
      setComingSoon,
      toggleOutOfStock,
      toggleOutOfStockColor,
      toggleOutOfStockSize,
      toggleOutOfStockColorSize,
      isColorOutOfStock,
      isSizeOutOfStock,
      isColorSizeOutOfStock,
      loaded,
    }}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
