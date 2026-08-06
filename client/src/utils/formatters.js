export const formatCurrency = (amount, currencyCode = 'USD ($)') => {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount || 0);

  let code = currencyCode || 'USD';
  if (code.includes(' ')) {
    code = code.split(' ')[0];
  }

  const localeMap = {
    INR: 'en-IN',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    CAD: 'en-CA',
    AUD: 'en-AU',
    USD: 'en-US'
  };

  const locale = localeMap[code] || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: code === 'JPY' ? 0 : 2,
      maximumFractionDigits: code === 'JPY' ? 0 : 2
    }).format(numeric);
  } catch (e) {
    return `${code} ${numeric.toFixed(2)}`;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7);
};
