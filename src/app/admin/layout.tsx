import { redirect } from "next/navigation";
import { AuthService } from "@/lib/appwrite/services/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await AuthService.getCurrentUser();
  if (!auth?.user) {
    redirect("/auth");
  }

  if (auth.user.labels.includes("admin")) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
        <ul className="space-y-2">
          <li>
            <a
              href="/admin/dashboard"
              className="block py-2 px-4 hover:bg-gray-700 rounded"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="/admin/subscriptions"
              className="block py-2 px-4 hover:bg-gray-700 rounded"
            >
              Subscriptions
            </a>
          </li>
          <li>
            <a
              href="/admin/transactions"
              className="block py-2 px-4 hover:bg-gray-700 rounded"
            >
              Transactions
            </a>
          </li>
          <li>
            <a
              href="/admin/customers"
              className="block py-2 px-4 hover:bg-gray-700 rounded"
            >
              Customers
            </a>
          </li>
          <li>
            <a
              href="/admin/plans"
              className="block py-2 px-4 hover:bg-gray-700 rounded"
            >
              Plans
            </a>
          </li>
        </ul>
      </nav>
      <main className="flex-1 bg-gray-100">{children}</main>
    </div>
  );
}
