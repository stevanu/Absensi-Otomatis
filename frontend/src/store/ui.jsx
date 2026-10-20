import { createContext, useCallback, useContext, useState } from 'react';

/**
 * Lightweight global UI store: toast notifications + sidebar collapse state.
 * Avoids pulling in an extra state library for such a small surface.
 */

const UIContext = createContext(null);

let toastId = 0;

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pushToast = useCallback((type, message) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const toast = {
    success: (m) => pushToast('success', m),
    error: (m) => pushToast('error', m),
    info: (m) => pushToast('info', m),
  };

  return (
    <UIContext.Provider value={{ toasts, toast, sidebarOpen, setSidebarOpen }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
