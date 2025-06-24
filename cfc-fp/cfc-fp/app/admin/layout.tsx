import Template from "@/components/admin/Template";
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Feedback Portal Admin",
  description: "Admin panel for managing feedback sessions.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Template>{children}</Template>;
} 