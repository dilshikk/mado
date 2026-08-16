import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/lib/api";

/**
 * ProtectedRoute - Защищенный маршрут
 * Проверяет наличие токена авторизации
 * Редиректит на /admin/login если токена нет
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/admin/login', { state: { from: location } });
        return;
      }

      try {
        // Verify token is still valid
        await api.getMe();
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid, clear it and redirect
        localStorage.removeItem('token');
        api.clearToken();
        navigate('/admin/login', { state: { from: location } });
      }
    };

    checkAuth();
  }, [navigate, location]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in effect
  }

  return <>{children}</>;
}
