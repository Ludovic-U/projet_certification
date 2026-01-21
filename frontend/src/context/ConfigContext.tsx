'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAppConfig, AppConfig } from '@/hooks/useAppConfig';

interface ConfigContextType {
  config: AppConfig;
  loading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const { config, loading, error } = useAppConfig();

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
