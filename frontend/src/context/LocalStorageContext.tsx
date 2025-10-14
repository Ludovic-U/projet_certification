"use client";
import { createContext, useContext, useState, useEffect } from "react";

type LocalStorageContextType = {
  data: Record<string, any>;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => void;
};

const LocalStorageContext = createContext<LocalStorageContextType | undefined>(undefined);

export function LocalStorageProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Record<string, any>>({});

  // Charger le localStorage uniquement côté client
  useEffect(() => {
    const storedData = localStorage.getItem("appData");
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  // Sauvegarder à chaque changement
  useEffect(() => {
    localStorage.setItem("appData", JSON.stringify(data));
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