// src/lib/supabaseClient.ts
// Supabase connection stub (Disconnected Mode)

const dummyQueryBuilder: any = {
  select: () => dummyQueryBuilder,
  insert: () => dummyQueryBuilder,
  update: () => dummyQueryBuilder,
  delete: () => dummyQueryBuilder,
  upsert: () => dummyQueryBuilder,
  eq: () => dummyQueryBuilder,
  neq: () => dummyQueryBuilder,
  gte: () => dummyQueryBuilder,
  lte: () => dummyQueryBuilder,
  in: () => dummyQueryBuilder,
  order: () => dummyQueryBuilder,
  limit: () => dummyQueryBuilder,
  single: async () => ({ data: null, error: null }),
  then: (onfulfilled?: ((value: { data: any[]; error: any }) => any) | null) =>
    Promise.resolve({ data: [] as any[], error: null }).then(onfulfilled),
};

export const supabase: any = {
  from: () => dummyQueryBuilder,
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: { id: 'local-user' } }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: { path: '' }, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: path } }),
    }),
  },
};
