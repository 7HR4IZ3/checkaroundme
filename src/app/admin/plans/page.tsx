"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminPlansPage() {
  const [isCreating, setIsCreating] = useState(false);
  const utils = trpc.useUtils();

  const { data: plans, isLoading } = trpc.admin.listPlans.useQuery();

  const createPlanMutation = trpc.admin.createPlan.useMutation({
    onSuccess: () => {
      utils.admin.listPlans.invalidate();
      setIsCreating(false);
    },
  });

  return (
    <AdminGuard>
      <AdminLayout
        heading="Subscription Plans"
        subheading="Manage your subscription plans and pricing"
      >
        <div className="flex justify-end mb-8">
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Plan</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createPlanMutation.mutate({
                    name: formData.get("name") as string,
                    amount: parseInt(formData.get("amount") as string) * 100,
                    interval: formData.get("interval") as any,
                    description: formData.get("description") as string,
                  });
                }}
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Plan Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (₦)</Label>
                    <Input id="amount" name="amount" type="number" required />
                  </div>
                  <div>
                    <Label htmlFor="interval">Billing Interval</Label>
                    <select
                      name="interval"
                      className="w-full border rounded p-2"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required />
                  </div>
                  <div>
                    <Label htmlFor="features">Features (one per line)</Label>
                    <Textarea id="features" name="features" required />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Plan
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans?.map((plan) => (
            <Card key={plan.id} className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-3xl font-bold">
                    {formatCurrency(plan.amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per {plan.interval}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {plan.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
