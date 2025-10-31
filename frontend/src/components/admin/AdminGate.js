"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminGate({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (!user.is_admin) router.replace("/");
    }
  }, [user, loading, router]);
  if (loading || !user) return <div className="p-6">Cargando…</div>;
  if (!user.is_admin) return null;
  return children;
}
