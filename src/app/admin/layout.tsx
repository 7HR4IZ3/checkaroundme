import { redirect } from "next/navigation";
import { AuthService } from "@/lib/appwrite/services/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await AuthService.getCurrentUser();
  if (!auth?.user) {
    redirect("/auth");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={auth.user} />
      <main className="flex-1 bg-gray-100">{children}</main>
    </div>
  );
}
