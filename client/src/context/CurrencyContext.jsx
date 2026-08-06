import React, { createContext, useContext, useState } from 'react';
import { formatCurrency as formatCurrencyUtil } from '../utils/formatters';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('fp_currency') || 'USD ($)';
  });

  const changeCurrency = (newCurrency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('fp_currency', newCurrency);
  };

  const formatCurrency = (amount) => {
    return formatCurrencyUtil(amount, currency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: 'USD ($)',
      changeCurrency: () => {},
      formatCurrency: (val) => formatCurrencyUtil(val, 'USD ($)')
    };
  }
  return context;
};
