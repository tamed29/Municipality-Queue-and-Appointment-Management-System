export interface BlockedDate {
  id: string;
  date: string;                  // "YYYY-MM-DD"
  type: 'holiday' | 'office_closure' | 'meeting' | 'maintenance' | 'training' | 'other';
  title: string;
  description?: string;
  affectedDepartments: string[]; // ['ALL'] or specific depts ['CIV', 'RES'] etc.
  createdBy: string;
  createdAt: string;
}

const BLOCKED_DATES_KEY = 'mqams_blocked_dates';

const defaultHolidays: BlockedDate[] = [
  {
    id: 'holiday_genna',
    date: '2026-01-07',
    type: 'holiday',
    title: 'Ethiopian Christmas (Genna)',
    description: 'Public Holiday',
    affectedDepartments: ['ALL'],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'holiday_timkat',
    date: '2026-01-19',
    type: 'holiday',
    title: 'Ethiopian Epiphany (Timkat)',
    description: 'Public Holiday',
    affectedDepartments: ['ALL'],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'holiday_adwa',
    date: '2026-03-02',
    type: 'holiday',
    title: 'Victory of Adwa Day',
    description: 'Public Holiday',
    affectedDepartments: ['ALL'],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'holiday_good_friday',
    date: '2026-04-05',
    type: 'holiday',
    title: 'Good Friday',
    description: 'Public Holiday',
    affectedDepartments: ['ALL'],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'holiday_labour_day',
    date: '2026-05-01',
    type: 'holiday',
    title: 'International Labour Day',
    description: 'Public Holiday',
    affectedDepartments: ['ALL'],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'holiday_patriots_day',
    date: '2026-05-05',
    type: 'holiday',
    title: 'Ethiopian Patriots Day',
    description: 'Public Holiday',
    affectedDepartments: ['ALL'],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'holiday_derg_downfall',
    date: '2026-05-28',
    type: 'holiday',
    title: 'Derg Downfall Day',
    description: 'Public Holiday',
    affectedDepartments: ['ALL'],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'holiday_new_year',
    date: '2026-09-11',
    type: 'holiday',
    title: 'Ethiopian New Year (Enkutatash)',
    description: 'Public Holiday',
    affectedDepartments: ['ALL'],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'holiday_meskel',
    date: '2026-09-27',
    type: 'holiday',
    title: 'Meskel (Finding of True Cross)',
    description: 'Public Holiday',
    affectedDepartments: ['ALL'],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  // Islamic Holidays
  {
    id: 'holiday_eid_alfitr',
    date: '2026-03-20',
    type: 'holiday',
    title: 'Eid Al-Fitr',
    description: 'Public Holiday (approximate)',
    affectedDepartments: ['ALL'],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'holiday_eid_aladha',
    date: '2026-05-27',
    type: 'holiday',
    title: 'Eid Al-Adha',
    description: 'Public Holiday (approximate)',
    affectedDepartments: ['ALL'],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'holiday_mawlid',
    date: '2026-08-26',
    type: 'holiday',
    title: 'Mawlid (Prophet Birthday)',
    description: 'Public Holiday (approximate)',
    affectedDepartments: ['ALL'],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  }
];

export const getBlockedDates = (): BlockedDate[] => {
  try {
    const raw = localStorage.getItem(BLOCKED_DATES_KEY);
    if (!raw) {
      // Preload default holidays
      localStorage.setItem(BLOCKED_DATES_KEY, JSON.stringify(defaultHolidays));
      return defaultHolidays;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get blocked dates', e);
    return [];
  }
};

// Check if a date is a Sunday
export const isSunday = (dateStr: string): boolean => {
  if (!dateStr) return false;
  // Parse date string carefully to avoid timezone shift
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.getDay() === 0;
  }
  return new Date(dateStr).getDay() === 0;
};

// Check if a date is blocked for a specific department (or ALL)
export const isDateBlocked = (dateStr: string, departmentCode?: string): boolean => {
  if (!dateStr) return false;

  // 1. Is it Sunday?
  if (isSunday(dateStr)) return true;

  // 2. Is it in the past?
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr < todayStr) return true;

  // 3. Match blocked dates
  const list = getBlockedDates();
  const matched = list.find(b => b.date === dateStr);
  if (!matched) return false;

  if (matched.affectedDepartments.includes('ALL')) return true;
  if (departmentCode && matched.affectedDepartments.includes(departmentCode)) return true;

  return false;
};

// Check if blocked for all departments
export const isDateBlockedForAll = (dateStr: string): boolean => {
  if (!dateStr) return false;
  if (isSunday(dateStr)) return true;

  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr < todayStr) return true;

  const list = getBlockedDates();
  const matched = list.find(b => b.date === dateStr);
  if (!matched) return false;

  return matched.affectedDepartments.includes('ALL');
};

// Get reason / info for a blocked date
export const getBlockedDateInfo = (dateStr: string, departmentCode?: string): BlockedDate | null => {
  if (!dateStr) return null;

  if (isSunday(dateStr)) {
    return {
      id: 'sunday',
      date: dateStr,
      type: 'other',
      title: 'Sunday Office Closure',
      description: 'The municipal office is closed on Sundays.',
      affectedDepartments: ['ALL'],
      createdBy: 'system',
      createdAt: new Date().toISOString()
    };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr < todayStr) {
    return {
      id: 'past_date',
      date: dateStr,
      type: 'other',
      title: 'Past Date',
      description: 'Appointments cannot be booked on past dates.',
      affectedDepartments: ['ALL'],
      createdBy: 'system',
      createdAt: new Date().toISOString()
    };
  }

  const list = getBlockedDates();
  const matched = list.find(b => b.date === dateStr);
  if (!matched) return null;

  if (matched.affectedDepartments.includes('ALL') || (departmentCode && matched.affectedDepartments.includes(departmentCode))) {
    return matched;
  }

  return null;
};

export const addBlockedDate = (blocked: BlockedDate): void => {
  try {
    const list = getBlockedDates();
    const updated = [...list, blocked].sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(BLOCKED_DATES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to add blocked date', e);
  }
};

export const removeBlockedDate = (id: string): void => {
  try {
    const list = getBlockedDates();
    const updated = list.filter(b => b.id !== id);
    localStorage.setItem(BLOCKED_DATES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to remove blocked date', e);
  }
};
