"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

export default function VerificationPage() {
  const params = useParams();
  const documentId = params.documentId as string;

  const {
    data: submission,
    isLoading,
    error,
  } = trpc.getAnonymousSubmissionById.useQuery(documentId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  if (!submission) {
    return <div>Submission not found.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">
        Anonymous Submission Verification
      </h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <p>
            <strong>Name:</strong> {submission.name}
          </p>
          <p>
            <strong>Address:</strong> {submission.address}
          </p>
          <p>
            <strong>Submitted File:</strong>
            {submission.fileURL ? (
              <a
                href={submission.fileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-2"
              >
                View/Download File
              </a>
            ) : (
              <span className="ml-2 text-gray-500">File not available</span>
            )}
          </p>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Salary Account Details</h2>
          <p>
            <strong>Name:</strong> {submission.salaryAccount.name}
          </p>
          <p>
            <strong>Bank Name:</strong> {submission.salaryAccount.bankName}
          </p>
          <p>
            <strong>Bank Account:</strong>{" "}
            {submission.salaryAccount.bankAccount}
          </p>
        </div>
        <div>
          <p>
            <strong>Special Code:</strong> {submission.specialCode}
          </p>
        </div>
      </div>
    </div>
  );
}
