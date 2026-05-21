export const QUEUE_STATE_KEY = 'mqams_queue_state';
export const APPOINTMENTS_KEY = 'mqams_appointments';

export interface QueueState {
  servedIds: string[];        // appointment IDs fully served
  calledIds: string[];        // currently being called/served
  noShowIds: string[];        // marked no-show
  lastUpdated: number;        // timestamp for conflict resolution
  version: number;            // increment on every write
}

// Always read fresh from localStorage — never cache in memory
export const getQueueState = (): QueueState => {
  try {
    const raw = localStorage.getItem(QUEUE_STATE_KEY);
    if (!raw) return { 
      servedIds: [], calledIds: [], noShowIds: [], 
      lastUpdated: 0, version: 0 
    };
    return JSON.parse(raw);
  } catch {
    return { 
      servedIds: [], calledIds: [], noShowIds: [], 
      lastUpdated: 0, version: 0 
    };
  }
}

export const saveQueueState = (state: QueueState) => {
  state.lastUpdated = Date.now();
  state.version = (state.version || 0) + 1;
  localStorage.setItem(QUEUE_STATE_KEY, JSON.stringify(state));
  // Force storage event for cross-tab sync
  window.dispatchEvent(new StorageEvent('storage', { 
    key: QUEUE_STATE_KEY,
    newValue: JSON.stringify(state)
  }));
}
