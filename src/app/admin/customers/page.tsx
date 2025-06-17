"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PaystackCustomer } from "@/lib/schema";

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );

  const { data: customers, isLoading } = trpc.admin.listCustomers.useQuery({
    page,
    limit: 10,
    search,
  });

  const { data: customerDetails } = trpc.admin.getCustomerDetails.useQuery(
    { customerId: selectedCustomerId! },
    { enabled: !!selectedCustomerId }
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Customer Code</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers?.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{`${customer.first_name} ${customer.last_name}`}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.customer_code}</TableCell>
              <TableCell>{customer.phone || "N/A"}</TableCell>
              <TableCell>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedCustomerId(customer.customer_code)
                      }
                    >
                      View Details
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Customer Details</SheetTitle>
                    </SheetHeader>
                    {customerDetails && (
                      <div className="py-4">
                        <h3 className="font-bold mb-2">Profile</h3>
                        <div className="space-y-2">
                          <p>
                            Name: {customerDetails.first_name}{" "}
                            {customerDetails.last_name}
                          </p>
                          <p>Email: {customerDetails.email}</p>
                          <p>Phone: {customerDetails.phone}</p>
                        </div>

                        <h3 className="font-bold mt-6 mb-2">Subscriptions</h3>
                        <div className="space-y-2">
                          {customerDetails.subscriptions.map((sub) => (
                            <div key={sub.id} className="border-b py-2">
                              <p>Plan: {sub.plan.name}</p>
                              <p>Status: {sub.status}</p>
                              <p>Started: {sub.start}</p>
                            </div>
                          ))}
                        </div>

                        <h3 className="font-bold mt-6 mb-2">
                          Recent Transactions
                        </h3>
                        <div className="space-y-2">
                          {customerDetails.transactions.map((tx) => (
                            <div key={tx.id} className="border-b py-2">
                              <p>
                                {new Date(tx.paid_at).toLocaleDateString()} - ₦
                                {tx.amount}
                              </p>
                              <p className="text-sm text-gray-600">
                                {tx.reference}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </SheetContent>
                </Sheet>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={
            customers?.length < 10
          }
        >
          Next
        </Button>
      </div> */}
    </div>
  );
}
