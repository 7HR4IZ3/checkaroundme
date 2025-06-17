"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentTransaction } from "@/lib/schema";

export default function AdminTransactionsPage() {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [search, setSearch] = useState("");

  const { data: transactions, isLoading } =
    trpc.admin.listTransactions.useQuery({
      page,
      limit: 10,
      startDate: dateRange.from?.toISOString(),
      endDate: dateRange.to?.toISOString(),
      search,
    });

  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{transactions?.total || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Date Range</Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={setDateRange as any}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions?.data.map((transaction: PaymentTransaction) => (
            <TableRow key={transaction.$id}>
              <TableCell>{format(new Date(transaction.date), "PPP")}</TableCell>
              <TableCell>{transaction.providerTransactionId}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>₦{transaction.amount.toFixed(2)}</TableCell>
              <TableCell>{transaction.status}</TableCell>
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
          disabled={!transactions?.hasMore}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
