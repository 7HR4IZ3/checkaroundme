"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { AnonymousSubmission } from "@/lib/schema";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";

const SECRET_PASSWORD = "PASSWORD";

interface SubmissionDialogProps {
  submission: AnonymousSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  mode: "view" | "edit";
}

const SubmissionDialog = ({
  submission,
  isOpen,
  onClose,
  mode,
}: SubmissionDialogProps) => {
  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "view" ? "Submission Details" : "Edit Submission"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Name</h3>
              <p>{submission.name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Special Code</h3>
              <p>{submission.specialCode}</p>
            </div>
            <div className="col-span-2">
              <h3 className="font-semibold">Address</h3>
              <p>{submission.address}</p>
            </div>
            <div className="col-span-2">
              <h3 className="font-semibold">Salary Account Details</h3>
              <p>Name: {submission.salaryAccount.name}</p>
              <p>Bank: {submission.salaryAccount.bankName}</p>
              <p>Account: {submission.salaryAccount.bankAccount}</p>
            </div>
            {submission.fileURL && (
              <div className="col-span-2">
                <h3 className="font-semibold">Submitted ID</h3>
                <img
                  src={submission.fileURL}
                  alt="Submitted ID"
                  className="max-w-full h-auto mt-2"
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function AnonymousSubmissionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const password = searchParams.get("password");
  const currentPage = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 20;

  const [hasAccess, setHasAccess] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(
    new Set()
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<AnonymousSubmission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [batchDeleting, setBatchDeleting] = useState(false);

  const utils = trpc.useUtils();
  const {
    data: paginatedData,
    isLoading,
    error: trpcError,
    refetch,
  } = trpc.getAllAnonymousSubmission.useQuery(
    { page: currentPage, perPage },
    { enabled: hasAccess }
  );

  // You need to implement this mutation in your trpc router/service
  const deleteMutation = trpc.deleteAnonymousSubmission.useMutation({
    onSuccess() {
      toast.success(`Deleted item`);
      utils.getAllAnonymousSubmission.refetch({ page: currentPage, perPage });
    },
    onError() {
      toast.error("Error deleting item");
    },
  });
  const batchDeleteMutation = trpc.deleteAnonymousSubmissions.useMutation({
    onSuccess() {
      toast.success(`Deleted items`);
      utils.getAllAnonymousSubmission.refetch({ page: currentPage, perPage });
    },
    onError() {
      toast.error("Error deleting items");
    },
  });

  useEffect(() => {
    setHasAccess(password === SECRET_PASSWORD);
  }, [password]);

  const toggleSubmission = (id: string) => {
    setSelectedSubmissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (!paginatedData) return;
    setSelectedSubmissions((prev) =>
      prev.size === paginatedData.items.length
        ? new Set()
        : new Set(paginatedData.items.map((s) => s.$id))
    );
  };

  const handleAction = (action: string, submission: AnonymousSubmission) => {
    setSelectedSubmission(submission);
    switch (action) {
      case "view":
        setDialogMode("view");
        setDialogOpen(true);
        break;
      case "edit":
        setDialogMode("edit");
        setDialogOpen(true);
        break;
      case "delete":
        if (confirm("Are you sure you want to delete this submission?")) {
          deleteMutation.mutate({
            id: submission.$id,
          });
        }
        break;
    }
  };

  const updateQueryParams = (newPage: number, newPerPage?: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    if (newPerPage) params.set("per_page", newPerPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBatchDelete = async () => {
    if (!batchDeleteMutation || selectedSubmissions.size === 0) return;
    if (!confirm(`Delete ${selectedSubmissions.size} submissions?`)) return;
    setBatchDeleting(true);
    try {
      await batchDeleteMutation.mutateAsync({
        ids: Array.from(selectedSubmissions),
      });
      setSelectedSubmissions(new Set());
      refetch();
    } catch (e) {
      // handle error
    } finally {
      setBatchDeleting(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Loading submissions...</h1>
      </div>
    );
  }

  if (trpcError) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">
          Error loading submissions: {trpcError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Submissions Dashboard</h1>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            disabled={selectedSubmissions.size === 0 || batchDeleting}
            onClick={handleBatchDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {batchDeleting
              ? "Deleting..."
              : `Delete (${selectedSubmissions.size})`}
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Submission
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 flex items-center justify-center">
                <Checkbox
                  checked={
                    paginatedData?.items.length === selectedSubmissions.size &&
                    paginatedData?.items.length > 0
                  }
                  onCheckedChange={toggleAll}
                  className="h-6 w-6"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Special Code</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead className="text-center">
                Businesses Registered
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData?.items.map((submission) => (
              <TableRow
                key={submission.$id}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedSubmission(submission);
                  setDialogMode("view");
                  setDialogOpen(true);
                }}
              >
                <TableCell
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSubmission(submission.$id);
                  }}
                  tabIndex={0}
                  aria-label={
                    selectedSubmissions.has(submission.$id)
                      ? "Deselect row"
                      : "Select row"
                  }
                  role="checkbox"
                  aria-checked={selectedSubmissions.has(submission.$id)}
                  className="flex items-center justify-center"
                >
                  <Checkbox
                    checked={selectedSubmissions.has(submission.$id)}
                    tabIndex={-1}
                    aria-label={
                      selectedSubmissions.has(submission.$id)
                        ? "Deselect row"
                        : "Select row"
                    }
                    className="h-6 w-6"
                  />
                </TableCell>
                <TableCell>{submission.name}</TableCell>
                <TableCell>{submission.address}</TableCell>
                <TableCell>{submission.specialCode}</TableCell>
                <TableCell>{submission.salaryAccount.bankName}</TableCell>
                <TableCell className="flex items-center justify-center h-full text-center">
                  {typeof submission.businessCount === "number" ? (
                    submission.businessCount
                  ) : (
                    <span className="text-muted-foreground">...</span>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleAction("view", submission)}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction("edit", submission)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction("delete", submission)}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {paginatedData && paginatedData.pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * perPage + 1} to{" "}
            {Math.min(currentPage * perPage, paginatedData.total)} of{" "}
            {paginatedData.total} entries
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => updateQueryParams(currentPage - 1)}
                />
              </PaginationItem>

              {Array.from({ length: paginatedData.pageCount }).map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    onClick={() => updateQueryParams(i + 1)}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => updateQueryParams(currentPage + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <SubmissionDialog
        submission={selectedSubmission}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
      />
    </div>
  );
}
