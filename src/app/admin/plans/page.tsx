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
    <div className="container mx-auto py-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>Create New Plan</Button>
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
                  <select name="interval" className="w-full border rounded p-2">
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
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-4">
                ₦{(plan.amount / 100).toFixed(2)} / {plan.interval}
              </p>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              {/* <ul className="space-y-2">
                {plan.features?.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul> */}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline">Edit</Button>
              <Button variant="destructive">Delete</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
