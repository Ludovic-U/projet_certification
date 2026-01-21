"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";

type LocalStorageContextType = {
  data: Record<string, any>;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => void;
};

const LocalStorageContext = createContext<LocalStorageContextType | undefined>(undefined);

export function LocalStorageProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Record<string, any>>({});
  const isInitialized = useRef(false);

  // Charger le localStorage uniquement au montage
  useEffect(() => {
    if (!isInitialized.current) {
      const storedData = localStorage.getItem("appData");
      if (storedData) {
        setData(JSON.parse(storedData));
      }
      isInitialized.current = true;
    }
  }, []);

  // Sauvegarder à chaque changement (seulement après initialisation)
  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem("appData", JSON.stringify(data));
    }
  }, [data]);

  const setItem = (key: string, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const removeItem = (key: string) => {
    setData(prev => {
      const newData = { ...prev };
      delete newData[key];
      return newData;
    });
  };

  return (
    <LocalStorageContext.Provider value={{ data, setItem, removeItem }}>
      {children}
    </LocalStorageContext.Provider>
  );
}

export function useLocalStorage() {
  const context = useContext(LocalStorageContext);
  if (!context) throw new Error("useLocalStorage doit être utilisé dans un LocalStorageProvider");
  return context;
}