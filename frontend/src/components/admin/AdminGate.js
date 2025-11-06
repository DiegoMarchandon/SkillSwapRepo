"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";

export default function AdminGate({ children }) {
  const [ok, setOk] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/me"); // /api/me
        // Acepta is_admin o rol === 'admin'
        const isAdmin = !!(data?.is_admin ?? (data?.rol === "admin"));
        if (alive && isAdmin) setOk(true);
        else router.replace("/"); // no admin -> afuera
      } catch {
        router.replace("/"); // no autenticado -> afuera
      }
    })();
    return () => { alive = false; };
  }, [router]);

  if (!ok) return null;
  return children;
}
