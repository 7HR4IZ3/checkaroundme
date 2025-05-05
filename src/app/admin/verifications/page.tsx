"use client";

import React from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VerificationRequestItem } from "@/components/admin/verification-request-item";

export default function AdminVerificationsPage() {
  const pendingRequestsQuery = trpc.listPendingVerifications.useQuery();

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Pending Business Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequestsQuery.isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          )}
          {pendingRequestsQuery.isError && (
            <p className="text-red-500">
              Error loading verification requests:{" "}
              {pendingRequestsQuery.error?.message}
            </p>
          )}
          {!pendingRequestsQuery.isLoading &&
            !pendingRequestsQuery.isError &&
            pendingRequestsQuery.data && (
              <div>
                {pendingRequestsQuery.data.length === 0 ? (
                  <p>No pending verification requests found.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingRequestsQuery.data.map((request) => (
                      <VerificationRequestItem
                        key={request.verificationDocument.$id}
                        request={request}
                        refetch={pendingRequestsQuery.refetch}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
