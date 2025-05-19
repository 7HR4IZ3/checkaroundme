"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc/client";

const SECRET_PASSWORD = "PASSWORD"; // Placeholder for the secret password

interface Submission {
  $id: string;
  name: string;
  address: string;
  specialCode: string;
  // Add other relevant fields from your Appwrite collection
}

export default function AnonymousSubmissionsPage() {
  const searchParams = useSearchParams();
  const password = searchParams.get("password");

  const [hasAccess, setHasAccess] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    isLoading,
    error: trpcError,
  } = trpc.getAllAnonymousSubmission.useQuery(undefined, {
    enabled: hasAccess, // Only fetch if password is correct
  });

  useEffect(() => {
    if (password === SECRET_PASSWORD) {
      setHasAccess(true);
    } else {
      setHasAccess(false);
      setLoading(false); // Stop loading if no access
    }
  }, [password]);

  useEffect(() => {
    if (data) {
      setSubmissions(data as Submission[]); // Assuming data is an array of Submission
      setLoading(false);
    } else if (trpcError) {
      setError(trpcError.message);
      setLoading(false);
    }
  }, [data, trpcError]);

  if (!hasAccess) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Submissions</h1>
        <p>Loading submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Submissions</h1>
        <p className="text-red-500">Error loading submissions: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Submissions</h1>
      {submissions.length === 0 ? (
        <p>No submissions found.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Address</th>
              <th className="py-2 px-4 border-b">Special Code</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.$id}>
                <td className="py-2 px-4 border-b">{submission.name}</td>
                <td className="py-2 px-4 border-b">{submission.address}</td>
                <td className="py-2 px-4 border-b">{submission.specialCode}</td>
                <td className="py-2 px-4 border-b">
                  <a
                    href={`/admin/submissions/${submission.$id}`}
                    className="text-blue-500 hover:underline"
                  >
                    View Verification
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
