// src/lib/supabaseClient.ts
// Supabase connection stub with dynamic chainable query proxy (Disconnected / Local Mode)

function createChainableQueryBuilder(): any {
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === 'then') {
        return (onfulfilled?: ((value: { data: any[]; error: any; count?: number }) => any) | null) =>
          Promise.resolve({ data: [] as any[], error: null, count: 0 }).then(onfulfilled);
      }
      if (prop === 'single' || prop === 'maybeSingle') {
        return async () => ({ data: null, error: null });
      }
      if (typeof prop === 'string') {
        return (...args: any[]) => new Proxy({}, handler);
      }
      return (target as any)[prop];
    }
  };
  return new Proxy({}, handler);
}

export const supabase: any = {
  from: () => createChainableQueryBuilder(),
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
