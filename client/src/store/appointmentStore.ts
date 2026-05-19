export interface Appointment {
  id: string                    // e.g. "CIV-2026-0001"
  citizenId: string             // logged-in user ID
  citizenName: string
  citizenPhone: string
  citizenAge: number
  priorityType: 'elderly' | 'disabled' | 'pregnant' | 'regular'
  department: string
  service: string
  requestedDate: string         // "2026-05-20"
  requestedTimeSlot: string     // "09:30 AM"
  status: 'pending' | 'approved' | 'rejected' | 'called' | 'completed' | 'no-show'
  queueNumber: string           // "CIV-007" or "P-001"
  adminNote: string
  createdAt: string
  updatedAt: string
  notificationSeen: boolean
}

export interface CitizenNotification {
  id: string
  citizenId: string
  type: 'booking_confirmed' | 'appointment_approved' | 'appointment_rejected' | 'queue_called' | 'appointment_rescheduled'
  title: string
  message: string
  status: 'unread' | 'read'
  createdAt: string
}

// ----------------------------------------------------
// LOCALSTORAGE CORE ACCESSORS
// ----------------------------------------------------

export const getStoredAppointments = (): Appointment[] => {
  try {
    const raw = localStorage.getItem('mqams_appointments');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse appointments', e);
    return [];
  }
};

export const saveStoredAppointments = (appointments: Appointment[]) => {
  localStorage.setItem('mqams_appointments', JSON.stringify(appointments));
};

export const getStoredNotifications = (): CitizenNotification[] => {
  try {
    const raw = localStorage.getItem('mqams_notifications');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse notifications', e);
    return [];
  }
};

export const saveStoredNotifications = (notifications: CitizenNotification[]) => {
  localStorage.setItem('mqams_notifications', JSON.stringify(notifications));
};

// ----------------------------------------------------
// TRANSACTION HELPERS & SEQUENCING
// ----------------------------------------------------

export const createNotification = (
  citizenId: string,
  type: CitizenNotification['type'],
  title: string,
  message: string
) => {
  const newNotif: CitizenNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    citizenId,
    type,
    title,
    message,
    status: 'unread',
    createdAt: new Date().toISOString()
  };
  const current = getStoredNotifications();
  saveStoredNotifications([newNotif, ...current]);
};

// Map department names to codes
export const getDeptCode = (dept: string): string => {
  const map: Record<string, string> = {
    "Civil Registration Office": "CIV",
    "Civil Reg": "CIV",
    "Residence & Population Office": "RES",
    "Residence": "RES",
    "Business & Trade Office": "BUS",
    "Business": "BUS",
    "Land & Property Office": "LND",
    "Land": "LND",
    "Tax & Finance Office": "TAX",
    "Tax": "TAX",
    "Construction & Urban Planning Office": "CON",
    "Construction": "CON",
    "Public Services Office": "PUB",
    "Public": "PUB"
  };
  return map[dept] || "CIV";
};

// Auto-assign queue numbers sequentially per department per day
export const assignQueueNumber = (
  dept: string,
  date: string,
  priorityType: Appointment['priorityType']
): string => {
  const appointments = getStoredAppointments();
  const sameDayApps = appointments.filter(
    app => app.department === dept && app.requestedDate === date
  );

  const isPriority = priorityType !== 'regular';
  
  if (isPriority) {
    // Count existing priority bookings for that dept on that date
    const priorityCount = sameDayApps.filter(app => app.priorityType !== 'regular').length;
    const num = priorityCount + 1;
    return `P-${String(num).padStart(3, '0')}`;
  } else {
    // Count existing regular bookings
    const regularCount = sameDayApps.filter(app => app.priorityType === 'regular').length;
    const num = regularCount + 1;
    return String(num).padStart(3, '0');
  }
};

// Generate ticket ID format: [DEPT_CODE]-[YEAR]-[4-digit-sequence]
export const generateTicketId = (dept: string, date: string): string => {
  const deptCode = getDeptCode(dept);
  const year = new Date(date).getFullYear() || 2026;
  const appointments = getStoredAppointments();
  
  // Count how many appointments exist in this department in this year
  const deptAppsInYear = appointments.filter(app => {
    const appYear = new Date(app.requestedDate).getFullYear();
    return getDeptCode(app.department) === deptCode && appYear === year;
  });
  
  const seq = deptAppsInYear.length + 1;
  return `${deptCode}-${year}-${String(seq).padStart(4, '0')}`;
};
