import Taro from '@tarojs/taro';

/**
 * Supabase REST API 手动封装（兼容微信小程序环境）
 * 不使用 Supabase SDK，纯 wx.request 实现，避免小程序兼容问题
 *
 * ============ 注册步骤（5 分钟，零成本）============
 * 1. 打开 https://supabase.com 用邮箱注册（无需认证、无需绑卡）
 * 2. 创建新项目 → 选离你最近的区域（如 Singapore）
 * 3. 进入 SQL Editor → 执行以下 SQL 建表：
 *
 *    CREATE TABLE rooms (
 *      id TEXT PRIMARY KEY,
 *      game_mode TEXT DEFAULT 'cumulative',
 *      base_score INTEGER DEFAULT 10,
 *      players JSONB DEFAULT '[]',
 *      rounds JSONB DEFAULT '[]',
 *      is_game_over BOOLEAN DEFAULT false,
 *      created_at BIGINT DEFAULT 0,
 *      updated_at BIGINT DEFAULT 0
 *    );
 *
 *    ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
 *    CREATE POLICY "Allow all" ON rooms FOR ALL USING (true) WITH CHECK (true);
 *
 * 4. 进入 Settings → API → 拿到 Project URL 和 anon/public key
 * 5. 填入下方配置
 *
 * ============ 免费额度 ============
 * 500MB 数据库 + 5GB 带宽，4 人打麻将绑绑有余
 * ================================================
 */

// ============ 替换为你自己的凭证 ============
const SUPABASE_URL = 'https://aeflaggpxccztufmpqji.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlZmxhZ2dweGNjenR1Zm1wcWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNTQwMzcsImV4cCI6MjA5ODgzMDAzN30.wYim5jnjWDdYl8OzQ4IQHvwCDbsxXGOyDdyR24tlXI8';
// ================================================

function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };
}

/** 通用请求 */
function request<T>(method: string, path: string, body?: any): Promise<T> {
  return new Promise((resolve, reject) => {
    (wx as any).request({
      url: `${SUPABASE_URL}/rest/v1${path}`,
      method: method as any,
      header: getHeaders(),
      data: body,
      timeout: 10000,
      success: (res: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
        } else {
          reject(new Error(`Supabase ${res.statusCode}: ${JSON.stringify(res.data)}`));
        }
      },
      fail: (err: any) => {
        reject(new Error(err.errMsg || 'network fail'));
      },
    });
  });
}

/** 插入数据 */
export async function insertRow<T extends Record<string, any>>(
  table: string,
  data: T,
): Promise<T> {
  return request<T>('POST', `/${table}`, data);
}

/** 根据 ID 获取单条 */
export async function getRow<T>(
  table: string,
  id: string,
  idColumn = 'id',
): Promise<T | null> {
  const results = await request<T[]>('GET', `/${table}?${idColumn}=eq.${id}&limit=1`);
  return results.length > 0 ? results[0] : null;
}

/** 更新数据 */
export async function updateRow<T extends Record<string, any>>(
  table: string,
  id: string,
  data: Partial<T>,
  idColumn = 'id',
): Promise<void> {
  await request('PATCH', `/${table}?${idColumn}=eq.${id}`, data);
}
