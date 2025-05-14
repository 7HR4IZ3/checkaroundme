import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AppRouter } from "@/lib/trpc/router"; // Assuming router type export
import { inferRouterOutputs } from "@trpc/server";

// Infer the type for a single verification request item from the router output
type RouterOutput = inferRouterOutputs<AppRouter>;
type PendingVerification = RouterOutput["listPendingVerifications"][number];

interface VerificationRequestItemProps {
  request: PendingVerification;
  refetch: () => void;
}

export function VerificationRequestItem({
  request,
  refetch,
}: VerificationRequestItemProps) {
  if (!request.user || !request.business) return null;

  const [adminNotes, setAdminNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false); // To show notes field only when rejecting

  const mutation = trpc.updateVerificationStatus.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Verification status updated.`);
      } else {
        toast.error("Failed to update status.");
      }

      refetch(); // Refresh the list in the parent component
      setShowNotes(false); // Hide notes field after action
      setAdminNotes(""); // Clear notes
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const handleApprove = () => {
    mutation.mutate({
      verificationDocumentId: request.verificationDocument.$id,
      businessId: request.business?.$id!,
      newStatus: "verified",
    });
  };

  const handleReject = () => {
    if (showNotes && !adminNotes.trim()) {
      toast.warning("Admin notes are required for rejection.");
      return;
    }
    if (!showNotes) {
      setShowNotes(true); // Show notes field first if not visible
      toast.info("Please provide rejection notes below.");
      return;
    }
    mutation.mutate({
      verificationDocumentId: request.verificationDocument.$id,
      businessId: request.business?.$id!,
      newStatus: "rejected",
      adminNotes: adminNotes.trim(),
    });
  };

  const submittedAtDate = request.verificationDocument.$createdAt
    ? new Date(request.verificationDocument.$createdAt)
    : null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{request.business?.name}</CardTitle>
        <CardDescription>
          Submitted by: {request.user?.name} ({request.user?.email})
          <br />
          {submittedAtDate
            ? `Submitted ${formatDistanceToNow(submittedAtDate, {
                addSuffix: true,
              })}`
            : "Submission date unavailable"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={request.documentFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 inline-block"
        >
          <Button variant="outline" disabled={mutation.isPending}>
            View Document
          </Button>
        </Link>

        {showNotes && (
          <div className="mt-4">
            <Textarea
              placeholder="Reason for rejection (required)..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              disabled={mutation.isPending}
              className="mb-2"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="destructive"
          onClick={handleReject}
          disabled={mutation.isPending}
          aria-label={showNotes ? "Confirm Reject" : "Reject"}
        >
          {mutation.isPending && mutation.variables?.newStatus === "rejected"
            ? "Rejecting..."
            : showNotes
              ? "Confirm Reject"
              : "Reject"}
        </Button>
        <Button
          onClick={handleApprove}
          disabled={mutation.isPending || showNotes} // Disable approve if notes are shown for rejection
          aria-label="Approve"
        >
          {mutation.isPending && mutation.variables?.newStatus === "verified"
            ? "Approving..."
            : "Approve"}
        </Button>
      </CardFooter>
    </Card>
  );
}
