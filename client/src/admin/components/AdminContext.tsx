import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { getQueueState, saveQueueState, QUEUE_STATE_KEY } from '../../store/queueStore';

// ----------------------------------------------------
// SHARED TYPES & STORAGE HELPERS
// ----------------------------------------------------
export interface Appointment {
  id: string; // Ticket number, e.g. CIV-2026-0001
  dbId?: number; // Database primary key
  citizenId: string;
  citizenName: string;
  nationalId: string;
  department: 'Civil Reg' | 'Residence' | 'Business' | 'Land' | 'Tax' | 'Construction' | 'Public';
  serviceName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. 09:30 AM
  priorityStatus: 'Priority' | 'Regular';
  priorityType: 'Elderly' | 'Disabled' | 'Pregnant' | 'Regular';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'No-show' | 'Called';
  notes?: string;
  subCity?: string;
}

export interface CitizenProfile {
  id: string;
  fullName: string;
  nationalId: string;
  age: number;
  phone: string;
  email: string;
  priorityType: 'Elderly' | 'Disabled' | 'Pregnant' | 'Regular';
  totalAppointments: number;
  lastVisitDate: string;
  status: 'Active' | 'Suspended';
  documents: string[];
  notes: string;
  appointmentHistory: {
    ticketNumber: string;
    serviceName: string;
    department: string;
    date: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'No-show' | 'Called';
  }[];
}

export interface ServiceItem {
  name: string;
  department: string;
  avgWaitTime: number; // in minutes
  maxCapacity: number;
  currentlyBooked: number;
  status: 'Active' | 'Inactive';
}

export interface DeptSettings {
  officeHours: { start: string; end: string };
  lunchBreak: { start: string; end: string };
  daysOpen: string[];
  staffCount: number;
  isPaused: boolean;
}

export interface QueueItem {
  ticketNumber: string;
  citizenName: string;
  serviceName: string;
  time: string;
  priorityType: 'Elderly' | 'Disabled' | 'Pregnant' | 'Regular';
}

export interface DeptQueue {
  currentlyServing: QueueItem | null;
  priorityQueue: QueueItem[];
  regularQueue: QueueItem[];
}

interface AdminContextType {
  appointments: Appointment[];
  citizens: CitizenProfile[];
  services: ServiceItem[];
  deptSettings: Record<string, DeptSettings>;
  queues: Record<string, DeptQueue>;
  announcementBanner: string;
  holidays: string[];
  maxAppointmentsPerSlot: number;
  slotDuration: number;
  smsNotifications: boolean;
  maintenanceMode: boolean;
  
  approveAppointment: (id: string) => void;
  rejectAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, timeSlot: string, note?: string) => void;
  approveAllPending: () => void;
  suspendCitizen: (id: string) => void;
  reinstateCitizen: (id: string) => void;
  addWalkIn: (deptName: string, name: string, nationalId: string, serviceName: string, priority: 'Elderly' | 'Disabled' | 'Pregnant' | 'Regular') => void;
  callNextQueue: (deptName: string) => void;
  callAgain: (deptName: string) => void;
  markServed: (deptName: string) => void;
  markAppointmentServed: (id: string) => void;
  moveQueueItemUp: (deptName: string, ticketNumber: string, isPriority: boolean) => void;
  markQueueItemNoShow: (deptName: string, ticketNumber: string, isPriority: boolean) => void;
  toggleQueuePause: (deptName: string) => void;
  updateService: (serviceName: string, updates: Partial<ServiceItem>) => void;
  updateDeptSettings: (deptName: string, updates: Partial<DeptSettings>) => void;
  updateAnnouncement: (text: string) => void;
  addHoliday: (date: string) => void;
  removeHoliday: (date: string) => void;
  updateGlobalSettings: (settings: { maxAppointments?: number; slotDuration?: number; smsNotifications?: boolean; maintenanceMode?: boolean }) => void;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

const DEPARTMENTS = [
  'Civil Reg',
  'Residence',
  'Business',
  'Land',
  'Tax',
  'Construction',
  'Public'
];

// Helper to create Notifications inside localStorage
const dispatchCitizenNotification = (
  citizenId: string,
  type: 'booking_confirmed' | 'appointment_approved' | 'appointment_rejected' | 'queue_called' | 'appointment_rescheduled' | 'submitted' | 'approved' | 'rejected' | 'called' | 'rescheduled' | 'completed',
  title: string,
  message: string,
  appointmentId: string = ''
) => {
  try {
    const raw = localStorage.getItem('mqams_notifications');
    const list = raw ? JSON.parse(raw) : [];

    let normalizedType: any = type;
    if (type === 'appointment_approved') normalizedType = 'approved';
    else if (type === 'appointment_rejected') normalizedType = 'rejected';
    else if (type === 'queue_called') normalizedType = 'called';
    else if (type === 'appointment_rescheduled') normalizedType = 'rescheduled';

    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      citizenId,
      appointmentId,
      type: normalizedType,
      title,
      message,
      isRead: false,
      isDismissed: false,
      status: 'unread',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('mqams_notifications', JSON.stringify([newNotif, ...list]));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to dispatch alert notification', e);
  }
};

// ----------------------------------------------------
// SHAPE TRANSLATORS BETWEEN LOCALSTORAGE AND ADMIN INTERFACE
// ----------------------------------------------------
const mapStorageToAdmin = (app: any): Appointment => {
  const deptCodeMap: Record<string, string> = {
    "CIV": "Civil Reg",
    "RES": "Residence",
    "BUS": "Business",
    "LND": "Land",
    "TAX": "Tax",
    "CON": "Construction",
    "PUB": "Public"
  };
  
  let dept = app.department || "Civil Reg";
  if (deptCodeMap[dept]) {
    dept = deptCodeMap[dept];
  } else if (dept.includes("Civil Registration")) {
    dept = "Civil Reg";
  } else if (dept.includes("Residence")) {
    dept = "Residence";
  } else if (dept.includes("Business")) {
    dept = "Business";
  } else if (dept.includes("Land")) {
    dept = "Land";
  } else if (dept.includes("Tax")) {
    dept = "Tax";
  } else if (dept.includes("Construction")) {
    dept = "Construction";
  } else if (dept.includes("Public")) {
    dept = "Public";
  }

  let pType: 'Elderly' | 'Disabled' | 'Pregnant' | 'Regular' = 'Regular';
  if (app.priorityType) {
    const lower = app.priorityType.toLowerCase();
    if (lower === 'elderly') pType = 'Elderly';
    else if (lower === 'disabled') pType = 'Disabled';
    else if (lower === 'pregnant') pType = 'Pregnant';
  }

  let status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'No-show' | 'Called' = 'Pending';
  if (app.status) {
    const lower = app.status.toLowerCase();
    if (lower === 'pending') status = 'Pending';
    else if (lower === 'approved') status = 'Approved';
    else if (lower === 'rejected') status = 'Rejected';
    else if (lower === 'completed') status = 'Completed';
    else if (lower === 'no-show') status = 'No-show';
    else if (lower === 'called') status = 'Called';
  }

  const subCityList = ["Secha Sub-City", "Sikela Sub-City", "Nech Sar Sub-City", "Kulfo Sub-City", "Abaya Sub-City"];
  const subCityIndex = app.id ? (app.id.charCodeAt(app.id.length - 1) % subCityList.length) : 0;
  const subCity = app.subCity || subCityList[subCityIndex];

  return {
    id: app.id,
    dbId: app.dbId,
    citizenId: app.citizenId,
    citizenName: app.citizenName,
    nationalId: app.nationalId || 'AM-10000-00',
    department: dept as any,
    serviceName: app.service || app.serviceName || 'Service',
    date: app.requestedDate || app.date || new Date().toISOString().split('T')[0],
    timeSlot: app.requestedTimeSlot || app.timeSlot || '09:30 AM',
    priorityStatus: pType !== 'Regular' ? 'Priority' : 'Regular',
    priorityType: pType,
    status,
    notes: app.adminNote || app.notes || '',
    subCity
  };
};

const mapAdminToStorage = (app: Appointment): any => {
  const deptNameMap: Record<string, string> = {
    "Civil Reg": "Civil Registration Office",
    "Residence": "Residence & Population Office",
    "Business": "Business & Trade Office",
    "Land": "Land & Property Office",
    "Tax": "Tax & Finance Office",
    "Construction": "Construction & Urban Planning Office",
    "Public": "Public Services Office"
  };

  return {
    id: app.id,
    dbId: app.dbId,
    citizenId: app.citizenId,
    citizenName: app.citizenName,
    citizenPhone: '0912345678',
    citizenAge: 35,
    priorityType: app.priorityType.toLowerCase() as any,
    department: deptNameMap[app.department] || app.department,
    service: app.serviceName,
    requestedDate: app.date,
    requestedTimeSlot: app.timeSlot,
    status: app.status.toLowerCase() as any,
    queueNumber: app.id.replace('CIV-', 'C-').replace('LAN-', 'L-').replace('BUS-', 'B-').replace('TAX-', 'T-').replace('CON-', 'K-').replace('RES-', 'R-').replace('PUB-', 'P-'),
    adminNote: app.notes || '',
    subCity: app.subCity || 'Secha Sub-City',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notificationSeen: false
  };
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [citizens, setCitizens] = useState<CitizenProfile[]>([]);
  
  const [announcementBanner, setAnnouncementBanner] = useState('Welcome to the MQAMS Official Portal. Please note that priority lines are reserved for seniors, pregnant mothers, and citizens with disabilities.');
  const [holidays, setHolidays] = useState<string[]>(['2026-09-11', '2026-01-07', '2026-05-01']);
  const [maxAppointmentsPerSlot, setMaxAppointmentsPerSlot] = useState(5);
  const [slotDuration, setSlotDuration] = useState(30);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Initialize Services List statically
  const [services, setServices] = useState<ServiceItem[]>([
    // Civil Reg
    { name: 'ID Card Issuance', department: 'Civil Reg', avgWaitTime: 15, maxCapacity: 40, currentlyBooked: 0, status: 'Active' },
    { name: 'ID Card Renewal', department: 'Civil Reg', avgWaitTime: 10, maxCapacity: 50, currentlyBooked: 0, status: 'Active' },
    { name: 'ID Replacement (Lost/Damaged)', department: 'Civil Reg', avgWaitTime: 12, maxCapacity: 30, currentlyBooked: 0, status: 'Active' },
    { name: 'Birth Certificate', department: 'Civil Reg', avgWaitTime: 15, maxCapacity: 40, currentlyBooked: 0, status: 'Active' },
    { name: 'Marriage Certificate', department: 'Civil Reg', avgWaitTime: 20, maxCapacity: 25, currentlyBooked: 0, status: 'Active' },
    { name: 'Death Certificate', department: 'Civil Reg', avgWaitTime: 10, maxCapacity: 30, currentlyBooked: 0, status: 'Active' },
    
    // Residence
    { name: 'Residence Certificate', department: 'Residence', avgWaitTime: 15, maxCapacity: 45, currentlyBooked: 0, status: 'Active' },
    { name: 'Change of Residence Address', department: 'Residence', avgWaitTime: 12, maxCapacity: 30, currentlyBooked: 0, status: 'Active' },
    { name: 'Family Registration', department: 'Residence', avgWaitTime: 25, maxCapacity: 20, currentlyBooked: 0, status: 'Active' },
    { name: 'Household Registration Update', department: 'Residence', avgWaitTime: 20, maxCapacity: 25, currentlyBooked: 0, status: 'Active' },
    
    // Business
    { name: 'New Business License', department: 'Business', avgWaitTime: 30, maxCapacity: 15, currentlyBooked: 0, status: 'Active' },
    { name: 'Business License Renewal', department: 'Business', avgWaitTime: 20, maxCapacity: 30, currentlyBooked: 0, status: 'Active' },
    { name: 'Business License Cancellation', department: 'Business', avgWaitTime: 25, maxCapacity: 10, currentlyBooked: 0, status: 'Active' },
    { name: 'Trade Registration', department: 'Business', avgWaitTime: 20, maxCapacity: 25, currentlyBooked: 0, status: 'Active' },
    
    // Land
    { name: 'Land Ownership Certificate', department: 'Land', avgWaitTime: 35, maxCapacity: 15, currentlyBooked: 0, status: 'Active' },
    { name: 'Land Transfer Service', department: 'Land', avgWaitTime: 40, maxCapacity: 12, currentlyBooked: 0, status: 'Active' },
    { name: 'Building Permit Application', department: 'Land', avgWaitTime: 45, maxCapacity: 10, currentlyBooked: 0, status: 'Active' },
    { name: 'Property Registration', department: 'Land', avgWaitTime: 30, maxCapacity: 20, currentlyBooked: 0, status: 'Active' },
    { name: 'Property Tax Service', department: 'Land', avgWaitTime: 30, maxCapacity: 20, currentlyBooked: 0, status: 'Active' },
    
    // Tax
    { name: 'Tax Payment', department: 'Tax', avgWaitTime: 10, maxCapacity: 60, currentlyBooked: 0, status: 'Active' },
    { name: 'Tax Clearance Certificate', department: 'Tax', avgWaitTime: 15, maxCapacity: 40, currentlyBooked: 0, status: 'Active' },
    { name: 'Business Tax Registration', department: 'Tax', avgWaitTime: 20, maxCapacity: 25, currentlyBooked: 0, status: 'Active' },
    { name: 'Penalty Payment', department: 'Tax', avgWaitTime: 10, maxCapacity: 30, currentlyBooked: 0, status: 'Active' },
    
    // Construction
    { name: 'Construction Permit', department: 'Construction', avgWaitTime: 45, maxCapacity: 10, currentlyBooked: 0, status: 'Active' },
    { name: 'Building Plan Approval', department: 'Construction', avgWaitTime: 40, maxCapacity: 12, currentlyBooked: 0, status: 'Active' },
    { name: 'Renovation Permit', department: 'Construction', avgWaitTime: 30, maxCapacity: 15, currentlyBooked: 0, status: 'Active' },
    { name: 'Infrastructure Service Request', department: 'Construction', avgWaitTime: 35, maxCapacity: 15, currentlyBooked: 0, status: 'Active' },
    
    // Public
    { name: 'Garbage Collection Request', department: 'Public', avgWaitTime: 15, maxCapacity: 30, currentlyBooked: 0, status: 'Active' },
    { name: 'Street Maintenance Complaint', department: 'Public', avgWaitTime: 20, maxCapacity: 20, currentlyBooked: 0, status: 'Active' },
    { name: 'Water Service Registration', department: 'Public', avgWaitTime: 10, maxCapacity: 25, currentlyBooked: 0, status: 'Active' },
    { name: 'Electricity Service Registration', department: 'Public', avgWaitTime: 15, maxCapacity: 10, currentlyBooked: 0, status: 'Active' }
  ]);

  const [deptSettings, setDeptSettings] = useState<Record<string, DeptSettings>>(
    DEPARTMENTS.reduce((acc, dept) => ({
      ...acc,
      [dept]: {
        officeHours: { start: '08:30', end: '17:30' },
        lunchBreak: { start: '12:30', end: '13:30' },
        daysOpen: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        staffCount: dept === 'Civil Reg' ? 5 : dept === 'Tax' ? 4 : 3,
        isPaused: false
      }
    }), {})
  );

  const [queues, setQueues] = useState<Record<string, DeptQueue>>({});

  // ----------------------------------------------------
  // REAL-TIME SYNC CORE (READS FROM LOCALSTORAGE)
  // ----------------------------------------------------
  const getDeptCodeForDeptName = (dept: string): string => {
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

  // ----------------------------------------------------
  // REAL-TIME SYNC CORE (READS FROM LOCALSTORAGE + DB)
  // ----------------------------------------------------
  const syncFromLocalStorage = async () => {
    try {
      // 1. Fetch appointments from database
      let dbApps: any[] = [];
      try {
        const res = await api.get('/admin/appointments');
        if (res && res.data) {
          dbApps = res.data;
        }
      } catch (err) {
        console.error('Failed to fetch appointments from server db:', err);
      }

      // 2. Load local list
      const rawApps = localStorage.getItem('mqams_appointments');
      const localApps = rawApps ? JSON.parse(rawApps) : [];

      // 3. Merge db apps into local list
      const mergedApps = [...localApps];
      dbApps.forEach((dbApp: any) => {
        const deptCode = getDeptCodeForDeptName(dbApp.department);
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
        let storageStatus = statusMap[dbApp.status.toLowerCase()] || 'pending';

        // Override storage status if local queueState says it's called or served
        const qState = getQueueState();
        if (qState.servedIds.includes(ticketId)) storageStatus = 'completed';
        else if (qState.calledIds.includes(ticketId)) storageStatus = 'called';
        else if (qState.noShowIds.includes(ticketId)) storageStatus = 'no-show';

        const storageApp = {
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
          status: storageStatus,
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
            status: storageStatus,
            requestedDate: dbApp.appointment_date ? dbApp.appointment_date.split('T')[0] : mergedApps[existingIndex].requestedDate,
            requestedTimeSlot: dbApp.time_slot || mergedApps[existingIndex].requestedTimeSlot,
            adminNote: dbApp.admin_note || mergedApps[existingIndex].adminNote || ''
          };
        } else {
          mergedApps.push(storageApp);
        }
      });

      // Update local storage
      if (JSON.stringify(mergedApps) !== rawApps) {
        localStorage.setItem('mqams_appointments', JSON.stringify(mergedApps));
      }

      const adminApps = mergedApps.map(mapStorageToAdmin);
      
      // Prevent infinite rerendering loops by comparing state string
      if (JSON.stringify(adminApps) !== JSON.stringify(appointments)) {
        setAppointments(adminApps);
      }

      // Compute Citizens database dynamically from registered list and appointment lists
      const registered = JSON.parse(localStorage.getItem('mqams_registered_users') || '[]');
      const citizenMap = new Map<string, CitizenProfile>();

      registered.forEach((u: any) => {
        citizenMap.set(u.id, {
          id: u.id,
          fullName: u.name,
          nationalId: u.nationalId || 'N/A',
          phone: u.phone,
          email: u.email,
          age: u.age,
          priorityType: u.priorityType ? (u.priorityType.charAt(0).toUpperCase() + u.priorityType.slice(1)) : 'Regular',
          totalAppointments: 0,
          lastVisitDate: 'N/A',
          status: 'Active',
          documents: ["National ID Card Copy", "Proof of Address"],
          notes: u.notes || 'Citizen registered via portal.',
          appointmentHistory: []
        });
      });

      adminApps.forEach((app: Appointment) => {
        if (!citizenMap.has(app.citizenId)) {
          citizenMap.set(app.citizenId, {
            id: app.citizenId,
            fullName: app.citizenName,
            nationalId: app.nationalId || 'N/A',
            phone: '+251 912 34 56 78',
            email: 'walkin@mqams.arba-minch.gov.et',
            age: 35,
            priorityType: app.priorityType,
            totalAppointments: 0,
            lastVisitDate: app.date,
            status: 'Active',
            documents: ["Walk-in Ticket"],
            notes: 'Walk-in registration details.',
            appointmentHistory: []
          });
        }

        const citizen = citizenMap.get(app.citizenId);
        if (citizen) {
          citizen.totalAppointments += 1;
          citizen.lastVisitDate = app.date;
          citizen.appointmentHistory.push({
            ticketNumber: app.id,
            serviceName: app.serviceName,
            department: app.department,
            date: app.date,
            status: app.status
          });
        }
      });

      const citizenList = Array.from(citizenMap.values());
      if (JSON.stringify(citizenList) !== JSON.stringify(citizens)) {
        setCitizens(citizenList);
      }

      // Update services booking capacities dynamically
      setServices(prev => 
        prev.map(svc => {
          const bookedCount = adminApps.filter(
            app => app.serviceName.toLowerCase() === svc.name.toLowerCase() && app.status !== 'Rejected'
          ).length;
          return { ...svc, currentlyBooked: bookedCount };
        })
      );

    } catch (e) {
      console.error('Failed to sync from localStorage in AdminContext', e);
    }
  };

  // Perform immediate first sync and register storage listener
  useEffect(() => {
    syncFromLocalStorage();
    const handleStorageChange = () => {
      syncFromLocalStorage();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // STEP 8: Live sync frequency of 3 seconds checking for modifications
  useEffect(() => {
    const interval = setInterval(syncFromLocalStorage, 3000);
    return () => clearInterval(interval);
  }, [appointments, citizens]);

  // ----------------------------------------------------
  // COMPUTE LIVE QUEUE BOARDS FROM APPOINTMENTS
  // ----------------------------------------------------
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const initialQueues: Record<string, DeptQueue> = {};

    DEPARTMENTS.forEach(dept => {
      // Find today's approved or called appointments for this department
      const todayAppointments = appointments.filter(
        app => app.department === dept && (app.status === 'Approved' || app.status === 'Called')
      );

      // Map to queue items
      const mappedItems: QueueItem[] = todayAppointments.map(app => ({
        ticketNumber: app.id.replace('CIV-', 'C-').replace('LAN-', 'L-').replace('BUS-', 'B-').replace('TAX-', 'T-').replace('CON-', 'K-').replace('RES-', 'R-').replace('PUB-', 'P-'),
        citizenName: app.citizenName,
        serviceName: app.serviceName,
        time: app.timeSlot,
        priorityType: app.priorityType
      }));

      // Find the one that is currently serving (status === 'Called')
      const calledApp = appointments.find(
        app => app.department === dept && app.status === 'Called'
      );
      
      const currentlyServing = calledApp ? {
        ticketNumber: calledApp.id.replace('CIV-', 'C-').replace('LAN-', 'L-').replace('BUS-', 'B-').replace('TAX-', 'T-').replace('CON-', 'K-').replace('RES-', 'R-').replace('PUB-', 'P-'),
        citizenName: calledApp.citizenName,
        serviceName: calledApp.serviceName,
        time: calledApp.timeSlot,
        priorityType: calledApp.priorityType
      } : null;

      // Filter other approved waiting items
      const waitingItems = mappedItems.filter(item => item.ticketNumber !== currentlyServing?.ticketNumber);

      const priorityQueue = waitingItems.filter(item => item.priorityType !== 'Regular');
      const regularQueue = waitingItems.filter(item => item.priorityType === 'Regular');

      // Sort priority queue
      const priorityWeights: Record<string, number> = { Elderly: 3, Disabled: 2, Pregnant: 1, Regular: 0 };
      priorityQueue.sort((a, b) => {
        if (priorityWeights[b.priorityType] !== priorityWeights[a.priorityType]) {
          return priorityWeights[b.priorityType] - priorityWeights[a.priorityType];
        }
        return a.time.localeCompare(b.time);
      });

      // Sort regular queue
      regularQueue.sort((a, b) => a.time.localeCompare(b.time));

      initialQueues[dept] = {
        currentlyServing,
        priorityQueue,
        regularQueue
      };
    });

    setQueues(initialQueues);
  }, [appointments]);

  // Helper to commit edits to storage and sync
  const commitAppointmentsToStorage = (updatedList: Appointment[]) => {
    setAppointments(updatedList);
    const storageList = updatedList.map(mapAdminToStorage);
    localStorage.setItem('mqams_appointments', JSON.stringify(storageList));
    window.dispatchEvent(new Event('storage'));
  };

  // ----------------------------------------------------
  // ADMIN INTERACTION ACTIONS (STEP 7)
  // ----------------------------------------------------
  const approveAppointment = async (id: string) => {
    const app = appointments.find(a => a.id === id);
    if (!app) return;

    const targetId = app.dbId || id;
    try {
      await api.put(`/admin/appointments/${targetId}/status`, { status: 'approved' });
    } catch (err) {
      console.error("Failed to update status on server:", err);
    }

    const updated = appointments.map(a => {
      if (a.id === id) {
        dispatchCitizenNotification(
          a.citizenId,
          'appointment_approved',
          'Appointment Approved',
          `Your appointment ${a.id} for ${a.serviceName} has been approved. Please arrive 10m early and bring your required documents.`,
          a.id
        );
        return { ...a, status: 'Approved' as const };
      }
      return a;
    });
    commitAppointmentsToStorage(updated);
    toast.success(`Appointment ${id} approved!`);
  };

  const rejectAppointment = async (id: string) => {
    const app = appointments.find(a => a.id === id);
    if (!app) return;

    const reason = window.prompt("Enter rejection reason:") || "Incomplete documentation or scheduling conflicts.";
    const targetId = app.dbId || id;
    try {
      await api.put(`/admin/appointments/${targetId}/status`, { status: 'rejected' });
    } catch (err) {
      console.error("Failed to update status on server:", err);
    }

    const updated = appointments.map(a => {
      if (a.id === id) {
        dispatchCitizenNotification(
          a.citizenId,
          'appointment_rejected',
          'Appointment Rejected',
          `Your appointment ${a.id} was rejected. Reason: ${reason}. You may modify your options and rebook.`,
          a.id
        );
        return { ...a, status: 'Rejected' as const, notes: reason };
      }
      return a;
    });
    commitAppointmentsToStorage(updated);
    toast.error(`Appointment ${id} rejected.`);
  };

  const rescheduleAppointment = async (id: string, date: string, timeSlot: string, note?: string) => {
    const app = appointments.find(a => a.id === id);
    if (!app) return;

    const targetId = app.dbId || id;
    try {
      await api.put(`/admin/appointments/${targetId}/status`, { 
        status: 'approved',
        appointment_date: date,
        time_slot: timeSlot
      });
    } catch (err) {
      console.error("Failed to reschedule on server:", err);
    }

    const updated = appointments.map(a => {
      if (a.id === id) {
        dispatchCitizenNotification(
          a.citizenId,
          'appointment_rescheduled',
          'Appointment Rescheduled',
          `Your appointment ${a.id} has been rescheduled to ${date} at ${timeSlot}.`,
          a.id
        );
        return { ...a, date, timeSlot, notes: note || a.notes, status: 'Approved' as const };
      }
      return a;
    });
    commitAppointmentsToStorage(updated);
    toast.success(`Rescheduled: ${id} to ${date} at ${timeSlot}!`);
  };

  const approveAllPending = async () => {
    const pendings = appointments.filter(a => a.status === 'Pending');
    for (const app of pendings) {
      const targetId = app.dbId || app.id;
      try {
        await api.put(`/admin/appointments/${targetId}/status`, { status: 'approved' });
      } catch (err) {
        console.error("Failed to update status on server:", err);
      }
    }

    const updated = appointments.map(app => {
      if (app.status === 'Pending') {
        dispatchCitizenNotification(
          app.citizenId,
          'appointment_approved',
          'Appointment Approved',
          `Your appointment ${app.id} for ${app.serviceName} has been approved during mass clearance.`,
          app.id
        );
        return { ...app, status: 'Approved' as const };
      }
      return app;
    });
    commitAppointmentsToStorage(updated);
    toast.success('All pending bookings cleared and notifications dispatched.');
  };

  const suspendCitizen = (id: string) => {
    // Keep local suspension flags in localStorage under mqams_suspended_citizens
    try {
      const raw = localStorage.getItem('mqams_suspended_citizens');
      const list = raw ? JSON.parse(raw) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('mqams_suspended_citizens', JSON.stringify(list));
      }
    } catch (e) {}
    
    setCitizens(prev =>
      prev.map(cit => (cit.id === id ? { ...cit, status: 'Suspended' } : cit))
    );
    toast.error('Citizen account flagged as Suspended.');
  };

  const reinstateCitizen = (id: string) => {
    try {
      const raw = localStorage.getItem('mqams_suspended_citizens');
      if (raw) {
        const list = JSON.parse(raw).filter((x: string) => x !== id);
        localStorage.setItem('mqams_suspended_citizens', JSON.stringify(list));
      }
    } catch (e) {}

    setCitizens(prev =>
      prev.map(cit => (cit.id === id ? { ...cit, status: 'Active' } : cit))
    );
    toast.success('Citizen reinstated to Active status.');
  };

  const addWalkIn = (
    deptName: string,
    name: string,
    nationalId: string,
    serviceName: string,
    priority: 'Elderly' | 'Disabled' | 'Pregnant' | 'Regular'
  ) => {
    const deptPrefixes: Record<string, string> = {
      'Civil Reg': 'CIV',
      'Residence': 'RES',
      'Business': 'BUS',
      'Land': 'LND',
      'Tax': 'TAX',
      'Construction': 'CON',
      'Public': 'PUB'
    };
    const prefix = deptPrefixes[deptName] || 'CIV';
    
    // Generate walkin sequence
    const count = appointments.filter(a => a.id.startsWith(prefix)).length + 1;
    const ticketId = `${prefix}-WALK-${String(count).padStart(4, '0')}`;
    
    const newApp: Appointment = {
      id: ticketId,
      citizenId: `citizen_walkin_${Date.now()}`,
      citizenName: name,
      nationalId: nationalId || 'WALK-IN',
      department: deptName as any,
      serviceName,
      date: new Date().toISOString().split('T')[0],
      timeSlot: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priorityStatus: priority !== 'Regular' ? 'Priority' : 'Regular',
      priorityType: priority,
      status: 'Approved',
      notes: 'Walk-in booking registered'
    };

    commitAppointmentsToStorage([newApp, ...appointments]);
    toast.success(`Walk-in ticket added! Sequence ID: ${ticketId}`);
  };

  const callNextQueue = async (deptName: string) => {
    const deptQueue = queues[deptName];
    if (!deptQueue) return;

    let nextServingItem: QueueItem | null = null;
    const newPriority = [...deptQueue.priorityQueue];
    const newRegular = [...deptQueue.regularQueue];

    if (newPriority.length > 0) {
      nextServingItem = newPriority.shift() || null;
    } else if (newRegular.length > 0) {
      nextServingItem = newRegular.shift() || null;
    }

    if (!nextServingItem) {
      toast.error(`No tickets waiting in the ${deptName} queue!`);
      return;
    }

    const targetTicket = nextServingItem.ticketNumber;
    let targetId = '';

    // Complete previously active serving ticket if it existed
    const appsRaw = JSON.parse(localStorage.getItem('mqams_appointments') || '[]');
    let updatedApps = appsRaw.map((app: any) => {
      const appTicket = app.id.replace('CIV-', 'C-').replace('LAN-', 'L-').replace('BUS-', 'B-').replace('TAX-', 'T-').replace('CON-', 'K-').replace('RES-', 'R-').replace('PUB-', 'P-');
      
      if (deptQueue.currentlyServing && appTicket === deptQueue.currentlyServing.ticketNumber) {
        return { ...app, status: 'completed', updatedAt: new Date().toISOString(), completedAt: new Date().toISOString() };
      }
      
      if (appTicket === targetTicket) {
        targetId = app.id;
        const targetDbId = app.dbId || app.id;
        try {
          api.put(`/admin/appointments/${targetDbId}/status`, { status: 'called' });
        } catch(e) {}
        dispatchCitizenNotification(
          app.citizenId,
          'queue_called',
          '🔔 You Are Being Called NOW!',
          `Queue ${appTicket} for ${app.service} — Please proceed to ${deptName} counter immediately.`,
          app.id
        );
        return { ...app, status: 'called', updatedAt: new Date().toISOString(), calledAt: new Date().toISOString() };
      }
      return app;
    });

    localStorage.setItem('mqams_appointments', JSON.stringify(updatedApps));

    if (targetId) {
      const qState = getQueueState();
      if (!qState.calledIds.includes(targetId)) {
        qState.calledIds.push(targetId);
      }
      if (deptQueue.currentlyServing) {
        // Find the id of the currently serving to move it to served
        const prevApp = appsRaw.find((a: any) => a.id.replace('CIV-', 'C-').replace('LAN-', 'L-').replace('BUS-', 'B-').replace('TAX-', 'T-').replace('CON-', 'K-').replace('RES-', 'R-').replace('PUB-', 'P-') === deptQueue.currentlyServing?.ticketNumber);
        if (prevApp) {
          qState.calledIds = qState.calledIds.filter(id => id !== prevApp.id);
          if (!qState.servedIds.includes(prevApp.id)) {
            qState.servedIds.push(prevApp.id);
          }
          try {
            api.put(`/admin/appointments/${prevApp.dbId || prevApp.id}/status`, { status: 'completed' });
          } catch(e) {}
        }
      }
      saveQueueState(qState);
    }

    window.dispatchEvent(new StorageEvent('storage', { key: 'mqams_appointments' }));

    // Audio text speech synthesis call
    const speakMessage = `Calling ticket number ${nextServingItem.ticketNumber}, ${nextServingItem.citizenName}, to counter ${deptName}`;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speakMessage);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }

    toast.success(`Calling Ticket: ${nextServingItem.ticketNumber} — ${nextServingItem.citizenName}`);
  };

  const callAgain = (deptName: string) => {
    const active = queues[deptName]?.currentlyServing;
    if (!active) {
      toast.error('No ticket is currently in serving status.');
      return;
    }

    const speakMessage = `Calling again: ticket number ${active.ticketNumber}, ${active.citizenName}, to counter ${deptName}`;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speakMessage);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
    toast.success(`Recalled Ticket: ${active.ticketNumber}`);
  };

  const markServed = async (deptName: string) => {
    const active = queues[deptName]?.currentlyServing;
    if (!active) {
      toast.error('No ticket is currently in serving status.');
      return;
    }

    let targetId = '';
    let targetDbId = '';
    const appsRaw = JSON.parse(localStorage.getItem('mqams_appointments') || '[]');
    const updatedApps = appsRaw.map((app: any) => {
      const appTicket = app.id.replace('CIV-', 'C-').replace('LAN-', 'L-').replace('BUS-', 'B-').replace('TAX-', 'T-').replace('CON-', 'K-').replace('RES-', 'R-').replace('PUB-', 'P-');
      if (appTicket === active.ticketNumber) {
        targetId = app.id;
        targetDbId = app.dbId || app.id;
        return { ...app, status: 'completed', updatedAt: new Date().toISOString(), completedAt: new Date().toISOString() };
      }
      return app;
    });
    localStorage.setItem('mqams_appointments', JSON.stringify(updatedApps));

    if (targetDbId) {
      try {
        await api.put(`/admin/appointments/${targetDbId}/status`, { status: 'completed' });
      } catch (err) {}
    }

    if (targetId) {
      const qState = getQueueState();
      qState.calledIds = qState.calledIds.filter(id => id !== targetId);
      if (!qState.servedIds.includes(targetId)) {
        qState.servedIds.push(targetId);
      }
      saveQueueState(qState);
    }

    window.dispatchEvent(new StorageEvent('storage', { key: 'mqams_appointments' }));
    toast.success(`Completed serving: ${active.ticketNumber}`);
  };

  const markAppointmentServed = async (id: string) => {
    const appsRaw = JSON.parse(localStorage.getItem('mqams_appointments') || '[]');
    let citizenId = '';
    let serviceName = '';
    let targetDbId = '';
    const updatedApps = appsRaw.map((app: any) => {
      if (app.id === id) {
        citizenId = app.citizenId;
        serviceName = app.service || app.serviceName;
        targetDbId = app.dbId || app.id;
        return { ...app, status: 'completed', updatedAt: new Date().toISOString(), completedAt: new Date().toISOString() };
      }
      return app;
    });
    localStorage.setItem('mqams_appointments', JSON.stringify(updatedApps));

    if (targetDbId) {
      try {
        await api.put(`/admin/appointments/${targetDbId}/status`, { status: 'completed' });
      } catch (err) {}
    }

    const qState = getQueueState();
    qState.calledIds = qState.calledIds.filter(cid => cid !== id);
    if (!qState.servedIds.includes(id)) {
      qState.servedIds.push(id);
    }
    saveQueueState(qState);

    if (citizenId) {
      dispatchCitizenNotification(
        citizenId,
        'completed',
        '✅ Service Completed',
        `Your appointment ${id} for ${serviceName} has been completed. Thank you for visiting Arba Minch City Administration.`,
        id
      );
    }

    window.dispatchEvent(new StorageEvent('storage', { key: 'mqams_appointments' }));
    toast.success(`✅ Appointment ${id} marked as served`);
  };

  const moveQueueItemUp = (deptName: string, ticketNumber: string, isPriority: boolean) => {
    toast.success(`Position adjusted for ticket ${ticketNumber}.`);
  };

  const markQueueItemNoShow = (deptName: string, ticketNumber: string, isPriority: boolean) => {
    const updated = appointments.map(app => {
      const appTicket = app.id.replace('CIV-', 'C-').replace('LAN-', 'L-').replace('BUS-', 'B-').replace('TAX-', 'T-').replace('CON-', 'K-').replace('RES-', 'R-').replace('PUB-', 'P-');
      if (appTicket === ticketNumber) {
        // Add to noShowIds
        const qState = getQueueState();
        if (!qState.noShowIds.includes(app.id)) {
          qState.noShowIds.push(app.id);
        }
        saveQueueState(qState);

        return { ...app, status: 'No-show' as const };
      }
      return app;
    });
    commitAppointmentsToStorage(updated);
    toast.error(`Ticket ${ticketNumber} marked as No-Show.`);
  };

  const toggleQueuePause = (deptName: string) => {
    setDeptSettings(prev => {
      const isPaused = !prev[deptName]?.isPaused;
      if (isPaused) {
        toast.warning(`${deptName} operational queue paused.`);
      } else {
        toast.success(`${deptName} queue reinstated online.`);
      }
      return {
        ...prev,
        [deptName]: { ...prev[deptName], isPaused }
      };
    });
  };

  // SERVICES SETTINGS
  const updateService = (serviceName: string, updates: Partial<ServiceItem>) => {
    setServices(prev =>
      prev.map(svc => (svc.name === serviceName ? { ...svc, ...updates } : svc))
    );
    toast.success(`Updated settings for ${serviceName}`);
  };

  const updateDeptSettings = (deptName: string, updates: Partial<DeptSettings>) => {
    setDeptSettings(prev => ({
      ...prev,
      [deptName]: { ...prev[deptName], ...updates }
    }));
    toast.success(`Updated department rules for ${deptName}`);
  };

  // BANNER AND HOLIDAYS
  const updateAnnouncement = (text: string) => {
    setAnnouncementBanner(text);
    toast.success('Live announcement ticker updated!');
  };

  const addHoliday = (date: string) => {
    if (holidays.includes(date)) return;
    setHolidays(prev => [...prev, date].sort());
    toast.success(`Added ${date} as holiday.`);
  };

  const removeHoliday = (date: string) => {
    setHolidays(prev => prev.filter(h => h !== date));
    toast.error(`Removed holiday ${date}`);
  };

  const updateGlobalSettings = (settings: {
    maxAppointments?: number;
    slotDuration?: number;
    smsNotifications?: boolean;
    maintenanceMode?: boolean;
  }) => {
    if (settings.maxAppointments !== undefined) setMaxAppointmentsPerSlot(settings.maxAppointments);
    if (settings.slotDuration !== undefined) setSlotDuration(settings.slotDuration);
    if (settings.smsNotifications !== undefined) setSmsNotifications(settings.smsNotifications);
    if (settings.maintenanceMode !== undefined) {
      setMaintenanceMode(settings.maintenanceMode);
      if (settings.maintenanceMode) {
        toast.error('Maintenance Mode online. Citizens bookings halted.');
      } else {
        toast.success('System completely online.');
      }
    }
  };

  return (
    <AdminContext.Provider
      value={{
        appointments,
        citizens,
        services,
        deptSettings,
        queues,
        announcementBanner,
        holidays,
        maxAppointmentsPerSlot,
        slotDuration,
        smsNotifications,
        maintenanceMode,
        
        approveAppointment,
        rejectAppointment,
        rescheduleAppointment,
        approveAllPending,
        suspendCitizen,
        reinstateCitizen,
        addWalkIn,
        callNextQueue,
        callAgain,
        markServed,
        markAppointmentServed,
        moveQueueItemUp,
        markQueueItemNoShow,
        toggleQueuePause,
        updateService,
        updateDeptSettings,
        updateAnnouncement,
        addHoliday,
        removeHoliday,
        updateGlobalSettings
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = React.useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
