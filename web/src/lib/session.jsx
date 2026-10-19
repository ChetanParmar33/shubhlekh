import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api.js';

// Who is logged in + the public catalog (plans, templates, payment mode), loaded once for the whole app.
const Ctx = createContext(null);

export function SessionProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = still loading
  const [site, setSite] = useState(null);

  useEffect(() => {
    api('/api/auth/me').then((r) => setUser(r.user)).catch(() => setUser(null));
    api('/api/plans').then(setSite).catch(() => setSite({ plans: {}, templates: [], payments: 'off', brand: 'Shubhlekh' }));
  }, []);

  const logout = useCallback(async () => { await api('/api/auth/logout', { method: 'POST' }); setUser(null); }, []);
  return <Ctx.Provider value={{ user, setUser, site, logout }}>{children}</Ctx.Provider>;
}

export const useSession = () => useContext(Ctx);
