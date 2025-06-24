// app/context/AlertContext.tsx
"use client";
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'; // <--- Added useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

// Define the type for an alert message
type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertMessage {
  id: string; // Unique ID for each message (useful for multiple concurrent alerts)
  message: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [mounted, setMounted] = useState(false); // <--- NEW: State to track if component is mounted on client

  const ALERT_DURATION = 3000; // 3 seconds

  useEffect(() => {
    // <--- NEW: Set mounted to true only after component mounts on client
    setMounted(true);
  }, []);

  const showAlert = useCallback((message: string, type: AlertType = 'info') => {
    const id = Date.now().toString(); // Simple unique ID
    const newAlert: AlertMessage = { id, message, type };

    setAlerts((prevAlerts) => [...prevAlerts, newAlert]);

    // Automatically remove the alert after ALERT_DURATION
    setTimeout(() => {
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
    }, ALERT_DURATION);
  }, []);

  // Helper to get icon and color based on alert type
  const getAlertStyles = (type: AlertType) => {
    switch (type) {
      case 'success':
      return {
        icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />,
        // NEW: Inspired by your user/profile gradients (purple-500 to indigo-500),
        // we'll use a similar gradient but with green tones.
        // from-green-500 (similar to purple-500) to-emerald-600 (a slightly deeper, richer green)
        bgColor: 'from-green-500 to-emerald-600',
      };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 sm:w-6 h-6 sm:h-6 mr-3" />,
          bgColor: 'from-red-500 to-rose-500',
        };
      case 'info':
        return {
          icon: <Info className="w-5 h-5 sm:w-6 h-6 sm:h-6 mr-3" />,
          bgColor: 'from-blue-500 to-cyan-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 sm:w-6 h-6 sm:h-6 mr-3" />,
          bgColor: 'from-orange-500 to-amber-500',
        };
      default:
        return {
          icon: <Info className="w-5 h-5 sm:w-6 h-6 sm:h-6 mr-3" />,
          bgColor: 'from-gray-500 to-slate-500',
        };
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {/* <--- MODIFIED: Only render the portal logic if mounted on the client */}
      {mounted && typeof document !== 'undefined' && document.getElementById('alert-root') &&
        createPortal(
            <div className="fixed top-6 right-6 z-[100] w-full max-w-sm px-4">
            <AnimatePresence>
              {alerts.map((alert) => {
                const { icon, bgColor } = getAlertStyles(alert.type);
                return (
                  <motion.div
                    key={alert.id}
                    className={`bg-gradient-to-r ${bgColor} text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-2xl flex items-center mb-3`}
                    initial={{ opacity: 0, y: -50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {icon}
                    <span className="font-medium text-lg flex-1 text-center">{alert.message}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>,
          document.getElementById('alert-root')! // Render into the 'alert-root' div
        )
      }
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};