"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaystackSubscription } from "@/lib/schema";
import { AdminGuard } from "@/components/admin/AdminGuard";

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  const { data: subscriptions, isLoading } =
    trpc.admin.listSubscriptions.useQuery({
      page,
      limit: 10,
      status: status as any,
      search,
    });

  const { data: analytics } = trpc.admin.getSubscriptionAnalytics.useQuery({});

  return (
    <AdminGuard>
      <div className="container mx-auto py-6">
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {analytics?.totalActive || 0}
              </p>
            </CardContent>
          </Card>
          {/* Add more analytics cards */}
        </div>

        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Next Payment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions?.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>{subscription.customer.email}</TableCell>
                <TableCell>{subscription.plan.name}</TableCell>
                <TableCell>{subscription.status}</TableCell>
                <TableCell>
                  {new Date(subscription.start).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {subscription.next_payment_date
                    ? new Date(
                        subscription.next_payment_date
                      ).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>Page {page}</span>
          <Button
            onClick={() => setPage((p) => p + 1)}
            disabled={!subscriptions || subscriptions.length < 10}
          >
            Next
          </Button>
        </div>
      </div>
    </AdminGuard>
  );
}
