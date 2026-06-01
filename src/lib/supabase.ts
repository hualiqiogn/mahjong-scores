const BASE = 'https://sfcuusotndtlfyfkworf.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmY3V1c290bmR0bGZ5Zmt3b3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNDQ4ODIsImV4cCI6MjA5NTcyMDg4Mn0.YqECvqlvzJAhSCXLIV6yw_mkrZhJixKmGWGTDG_3AP8';

function headers(): Record<string, string> {
  return {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
  };
}

function singleRequest<T>(method: string, path: string, body?: any): Promise<T> {
  return new Promise((resolve, reject) => {
    (wx as any).request({
      url: BASE + '/rest/v1/' + path,
      method,
      header: headers(),
      data: body || undefined,
      success: (res: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const data = res.data;
          if (typeof data === 'string') {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(data as T);
            }
          } else {
            resolve(data as T);
          }
        } else {
          reject(new Error(`Supabase ${res.statusCode}`));
        }
      },
      fail: () => {
        reject(new Error('network fail'));
      },
    });
  });
}

async function requestOnce<T>(method: string, path: string, body?: any): Promise<T> {
  return singleRequest<T>(method, path, body);
}

async function requestWithRetry<T>(method: string, path: string, body?: any): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < 2; i++) {
    try {
      return await singleRequest<T>(method, path, body);
    } catch (err) {
      lastError = err as Error;
      if (i < 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
  throw lastError;
}

export const db = {
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (col: string, val: string) => ({
        single: (): Promise<any> =>
          requestOnce('GET', `${table}?select=${columns}&${col}=eq.${val}&limit=1`).then(
            (rows: any) => (rows && rows.length > 0 ? rows[0] : null),
          ),
        execute: (): Promise<any[]> =>
          requestOnce('GET', `${table}?select=${columns}&${col}=eq.${val}`),
      }),
    }),
    insert: (record: any): Promise<void> =>
      requestOnce('POST', table, record).then(() => {}),
    update: (record: any) => ({
      eq: (col: string, val: string): Promise<void> =>
        requestWithRetry('PATCH', `${table}?${col}=eq.${val}`, record).then(() => {}),
    }),
  }),
};
