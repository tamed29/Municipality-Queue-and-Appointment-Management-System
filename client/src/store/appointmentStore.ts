// Core store using localStorage + storage events
import api from '../api/axios';

export const APPOINTMENTS_KEY = 'mqams_appointments';
export const NOTIFICATIONS_KEY = 'mqams_notifications';
export const USERS_KEY = 'mqams_users';

export interface Appointment {
  id: string                  // "CIV-2025-0001"
  dbId?: number               // Database primary key
  citizenId: string           // owner's user ID only
  citizenName: string
  citizenPhone: string
  citizenAge: number
  priorityType: 'elderly' | 'disabled' | 'pregnant' | 'regular'
  department: string
  departmentCode: string      // CIV, RES, BUS, LND, TAX, CON, PUB
  service: string
  requestedDate: string
  requestedTimeSlot: string
  status: 'pending' | 'approved' | 'rejected' | 
          'called' | 'completed' | 'no-show'
  queueNumber: string
  adminNote: string
  statusHistory: {
    status: string
    timestamp: string
    by: string
  }[]
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  citizenId: string           // CRITICAL: filter by this
  appointmentId: string
  type: 'submitted' | 'approved' | 'rejected' | 
        'called' | 'rescheduled' | 'completed' | 'booking_confirmed'
  title: string
  message: string
  isRead: boolean
  isDismissed: boolean        // for top banner
  createdAt: string
  status?: 'unread' | 'read'  // For backward compatibility
}

export interface CitizenUser {
  id: string                  // "citizen_[timestamp]"
  name: string
  nationalId: string
  phone: string
  age: number
  priorityType: string
}

// ----------------------------------------------------
// DUAL SYNC & REGISTRY SYSTEM
// ----------------------------------------------------

// Allow components to subscribe to storage changes
type Listener = () => void;
const listeners = new Set<Listener>();

export const subscribeToStore = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyAll = () => {
  listeners.forEach(l => {
    try {
      l();
    } catch (e) {
      console.error('Error notifying listener', e);
    }
  });
};

// Listen for cross-tab changes
window.addEventListener('storage', (e) => {
  if (e.key === APPOINTMENTS_KEY || e.key === NOTIFICATIONS_KEY || e.key === USERS_KEY || e.key === 'mqams_registered_users') {
    notifyAll();
  }
});

// Also poll every 2 seconds for same-tab/fallback updates
setInterval(() => {
  notifyAll();
}, 2000);

// ----------------------------------------------------
// STORE HELPER FUNCTIONS
// ----------------------------------------------------

// Always filter by citizenId — never leak other user data
export const getMyAppointments = (citizenId: string): Appointment[] => {
  return getAllAppointments().filter(app => app.citizenId === citizenId);
};

export const getMyNotifications = (citizenId: string): Notification[] => {
  return getStoredNotifications().filter(notif => notif.citizenId === citizenId);
};

export const getMyUnreadCount = (citizenId: string): number => {
  return getMyNotifications(citizenId).filter(notif => !notif.isRead && notif.status !== 'read').length;
};

// Admin gets everything
export const getAllAppointments = (): Appointment[] => {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse appointments', e);
    return [];
  }
};

export const getStoredNotifications = (): Notification[] => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse notifications', e);
    return [];
  }
};

export const getAppointmentsByDept = (dept: string): Appointment[] => {
  return getAllAppointments().filter(app => app.department === dept);
};

export const getAppointmentsByStatus = (status: string): Appointment[] => {
  return getAllAppointments().filter(app => app.status === status);
};

export const getTodaysAppointments = (): Appointment[] => {
  const today = new Date().toISOString().split('T')[0];
  return getAllAppointments().filter(app => app.requestedDate === today);
};

// Write functions — trigger storage event after every write
export const saveAppointment = (apt: Appointment): void => {
  const all = getAllAppointments();
  const index = all.findIndex(a => a.id === apt.id);
  if (index !== -1) {
    all[index] = apt;
  } else {
    all.push(apt);
  }
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('storage'));
  notifyAll();
};

export const updateAppointmentStatus = (id: string, status: Appointment['status'], adminNote?: string): void => {
  const all = getAllAppointments();
  const apt = all.find(a => a.id === id);
  if (apt) {
    apt.status = status;
    if (adminNote !== undefined) {
      apt.adminNote = adminNote;
    }
    apt.updatedAt = new Date().toISOString();
    if (!apt.statusHistory) {
      apt.statusHistory = [];
    }
    apt.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      by: 'admin'
    });
    saveAppointment(apt);
  }
};

export const saveNotification = (notif: Notification): void => {
  const all = getStoredNotifications();
  const index = all.findIndex(n => n.id === notif.id);
  if (index !== -1) {
    all[index] = notif;
  } else {
    all.unshift(notif);
  }
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('storage'));
  notifyAll();
};

export const markNotificationRead = (id: string): void => {
  const all = getStoredNotifications();
  const notif = all.find(n => n.id === id);
  if (notif) {
    notif.isRead = true;
    notif.status = 'read';
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event('storage'));
    notifyAll();
  }
};

export const dismissBannerNotification = (id: string): void => {
  const all = getStoredNotifications();
  const notif = all.find(n => n.id === id);
  if (notif) {
    notif.isDismissed = true;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event('storage'));
    notifyAll();
  }
};

// ----------------------------------------------------
// BACKWARD COMPATIBILITY & UTILITY HELPERS
// ----------------------------------------------------
export const getStoredAppointments = getAllAppointments;

export const saveStoredAppointments = (appointments: Appointment[]) => {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  window.dispatchEvent(new Event('storage'));
  notifyAll();
};

export const saveStoredNotifications = (notifications: Notification[]) => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new Event('storage'));
  notifyAll();
};

export const createNotification = (
  citizenId: string,
  type: Notification['type'],
  title: string,
  message: string,
  appointmentId: string = ''
) => {
  const newNotif: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    citizenId,
    appointmentId,
    type,
    title,
    message,
    isRead: false,
    isDismissed: false,
    status: 'unread',
    createdAt: new Date().toISOString()
  };
  saveNotification(newNotif);
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
    const priorityCount = sameDayApps.filter(app => app.priorityType !== 'regular').length;
    const num = priorityCount + 1;
    return `P-${String(num).padStart(3, '0')}`;
  } else {
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
  
  const deptAppsInYear = appointments.filter(app => {
    const appYear = new Date(app.requestedDate).getFullYear();
    return getDeptCode(app.department) === deptCode && appYear === year;
  });
  
  const seq = deptAppsInYear.length + 1;
  return `${deptCode}-${year}-${String(seq).padStart(4, '0')}`;
};

export const syncCitizenAppointments = async (citizenId: string): Promise<void> => {
  try {
    const res = await api.get('/appointments/my');
    if (!res || !res.data) return;
    const dbApps = res.data;

    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    const localApps: Appointment[] = raw ? JSON.parse(raw) : [];
    const mergedApps = [...localApps];

    dbApps.forEach((dbApp: any) => {
      const deptCode = getDeptCode(dbApp.department);
      const ticketId = `${deptCode}-${new Date(dbApp.appointment_date).getFullYear() || 2026}-${String(dbApp.id).padStart(4, '0')}`;
      
      const existingIndex = mergedApps.findIndex(
        (a: any) => a.id === ticketId || String(a.dbId) === String(dbApp.id) || String(a.id) === String(dbApp.id)
      );

      const statusMap: Record<string, string> = {
        'pending': 'pending',
        'approved': 'approved',
        'rejected': 'rejected',
        'called': 'called',
        'completed': 'completed',
        'no-show': 'no-show',
        'cancelled': 'rejected'
      };
      const storageStatus = statusMap[dbApp.status.toLowerCase()] || 'pending';

      const storageApp: Appointment = {
        id: ticketId,
        dbId: dbApp.id,
        citizenId: String(dbApp.user_id),
        citizenName: dbApp.full_name || 'Citizen',
        citizenPhone: dbApp.phone || '0912345678',
        citizenAge: 35,
        priorityType: 'regular',
        department: dbApp.department,
        departmentCode: deptCode,
        service: dbApp.service_name,
        requestedDate: dbApp.appointment_date ? dbApp.appointment_date.split('T')[0] : new Date().toISOString().split('T')[0],
        requestedTimeSlot: dbApp.time_slot,
        status: storageStatus as any,
        queueNumber: dbApp.queue_number || '001',
        adminNote: dbApp.admin_note || '',
        statusHistory: [
          {
            status: storageStatus,
            timestamp: dbApp.created_at || new Date().toISOString(),
            by: 'system'
          }
        ],
        createdAt: dbApp.created_at || new Date().toISOString(),
        updatedAt: dbApp.created_at || new Date().toISOString()
      };

      if (existingIndex !== -1) {
        mergedApps[existingIndex] = {
          ...mergedApps[existingIndex],
          dbId: dbApp.id,
          status: storageStatus as any,
          requestedDate: dbApp.appointment_date ? dbApp.appointment_date.split('T')[0] : mergedApps[existingIndex].requestedDate,
          requestedTimeSlot: dbApp.time_slot || mergedApps[existingIndex].requestedTimeSlot,
          adminNote: dbApp.admin_note || mergedApps[existingIndex].adminNote || ''
        };
      } else {
        mergedApps.push(storageApp);
      }
    });

    if (JSON.stringify(mergedApps) !== raw) {
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(mergedApps));
      window.dispatchEvent(new Event('storage'));
      notifyAll();
    }
  } catch (err) {
    console.error("Error syncing citizen appointments from db:", err);
  }
};
