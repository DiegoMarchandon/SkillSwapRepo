"use client";
import AdminGate from "@/components/admin/AdminGate";

export default function AdminLayout({ children }) {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
}

