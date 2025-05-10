"use client";

import React from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, Edit3, ExternalLink } from "lucide-react";

export function UserBusinesses() {
  const auth = useAuth();

  const {
    data: businesses,
    isLoading,
    error,
  } = trpc.getBusinessesByUserId.useQuery(
    { userId: auth.isAuthenticated ? auth.user.$id : "" },
    { enabled: auth.isAuthenticated },
  );

  if (!auth.isAuthenticated) {
    return (
      <Alert>
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please log in to view your businesses.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load your businesses: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold mb-2">No Businesses Yet</h3>
        <p className="text-muted-foreground mb-4">
          You haven't created any businesses. Get started by adding one!
        </p>
        <Button asChild>
          <Link href="/business/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Business
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Businesses</h2>
        <Button asChild variant="outline">
          <Link href="/business/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Business
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => (
          <Card key={business.$id}>
            <CardHeader>
              <CardTitle className="truncate">{business.name}</CardTitle>
              <CardDescription className="truncate">
                {business.categories.join(", ") || "No category"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground truncate h-10">
                {business.about || "No description provided."}
              </p>
              <div className="flex justify-between items-center pt-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/business/${business.$id}/edit`}>
                    <Edit3 className="mr-2 h-4 w-4" /> Edit
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/business/${business.$id}`} target="_blank">
                    View <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
