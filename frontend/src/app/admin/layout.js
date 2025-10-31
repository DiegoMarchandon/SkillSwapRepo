"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminGate from "@/components/admin/AdminGate";

export default function AdminLayout({ children }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"220px 1fr",minHeight:"100vh"}}>
      <aside style={{background:"#111",color:"#fff",padding:"12px"}}>Admin</aside>
      <main style={{padding:"16px"}}>{children}</main>
    </div>
  );
}
