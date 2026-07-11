import { useState, useEffect } from "react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  displayName: string | null;
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    setLoading(true);
    fetch(`${basePath}/api/auth/user`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setUser(data.authenticated ? (data.user as AuthUser) : null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refetch();
  }, []);

  const signOut = async () => {
    await fetch(`${basePath}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return { user, loading, refetch, signOut };
}
