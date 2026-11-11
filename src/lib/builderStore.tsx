'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Category, CompatibilityReport, ProductItem, SelectedParts } from './types';
import { checkCompatibility } from './compatibility';

interface BuilderContextType {
  parts: SelectedParts;
  selectPart: (category: Category, product: ProductItem) => void;
  removePart: (category: Category) => void;
  clearBuild: () => void;
  loadPresetBuild: (presetParts: SelectedParts) => void;
  totalPrice: number;
  report: CompatibilityReport;
  partsCount: number;
}

const BuilderContext = createContext<BuilderContextType | null>(null);

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parts, setParts] = useState<SelectedParts>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pc_builder_parts');
      if (saved) {
        setParts(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load build from local storage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pc_builder_parts', JSON.stringify(parts));
    }
  }, [parts, isLoaded]);

  const selectPart = (category: Category, product: ProductItem) => {
    setParts((prev) => ({
      ...prev,
      [category]: product,
    }));
  };

  const removePart = (category: Category) => {
    setParts((prev) => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  };

  const clearBuild = () => {
    setParts({});
    localStorage.removeItem('pc_builder_parts');
  };

  const loadPresetBuild = (presetParts: SelectedParts) => {
    setParts(presetParts);
    localStorage.setItem('pc_builder_parts', JSON.stringify(presetParts));
  };

  const totalPrice = Object.values(parts).reduce((sum, item) => {
    return sum + (item?.priceUzs || 0);
  }, 0);

  const partsCount = Object.values(parts).filter(Boolean).length;
  const report = checkCompatibility(parts);

  return (
    <BuilderContext.Provider
      value={{
        parts,
        selectPart,
        removePart,
        clearBuild,
        loadPresetBuild,
        totalPrice,
        report,
        partsCount,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
};
