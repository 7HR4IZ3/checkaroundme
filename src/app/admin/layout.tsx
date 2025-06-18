import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar/>
      <main className="flex-1 bg-gray-100">{children}</main>
    </div>
  );
}
