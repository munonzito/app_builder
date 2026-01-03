const DEBUG = __DEV__;

export const info = (...args: any[]) => {
  if (DEBUG) console.log('[Runtime]', ...args);
};

export const warn = (...args: any[]) => {
  if (DEBUG) console.warn('[Runtime]', ...args);
};

export const error = (...args: any[]) => {
  console.error('[Runtime]', ...args);
};

export const module = (...args: any[]) => {
  if (DEBUG) console.log('[Runtime:Module]', ...args);
};

export const comm = (...args: any[]) => {
  if (DEBUG) console.log('[Runtime:Comm]', ...args);
};

export const comm_recv = (...args: any[]) => {
  if (DEBUG) console.log('[Runtime:Comm:Recv]', ...args);
};
