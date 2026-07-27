// Converts a named date-range key (as used by the Analytics & Reporting filters)
// into concrete start_date/end_date bounds (YYYY-MM-DD) for the reporting API.

const toIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getDateRangeBounds = (rangeKey) => {
  const now = new Date();
  let start;
  let end = startOfDay(now);

  switch (rangeKey) {
    case 'today':
      start = startOfDay(now);
      break;
    case 'yesterday': {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      start = startOfDay(yesterday);
      end = startOfDay(yesterday);
      break;
    }
    case 'last_30_days': {
      const s = new Date(now);
      s.setDate(s.getDate() - 29);
      start = startOfDay(s);
      break;
    }
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'this_quarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    }
    case 'last_quarter': {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const quarter = (currentQuarter + 3) % 4;
      const year = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
      start = new Date(year, quarter * 3, 1);
      end = new Date(year, quarter * 3 + 3, 0);
      break;
    }
    case 'this_year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'last_7_days':
    default: {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      start = startOfDay(s);
      break;
    }
  }

  return { start_date: toIsoDate(start), end_date: toIsoDate(end) };
};
