"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { anonymousSubmissionSchema } from "@/lib/schema";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client"; // Import trpc client

const anonymousSubmissionFormSchema = anonymousSubmissionSchema.omit({
  $id: true,
});

type AnonymousSubmissionFormValues = z.infer<
  typeof anonymousSubmissionFormSchema
>;

const AnonymousSubmissionForm = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(anonymousSubmissionFormSchema),
    defaultValues: {
      name: "",
      address: "",
      title: "Marketing Associates",
      submitIdFileId: "",
      salaryAccount: {
        name: "",
        bankName: "",
        bankAccount: "",
      },
      specialCode: "", // This will be generated
    },
  });

  const [submitIdFile, setSubmitIdFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSubmitIdFile(event.target.files[0]);
    } else {
      setSubmitIdFile(null);
    }
  };

  const createSubmissionMutation = trpc.createAnonymousSubmission.useMutation();

  const onSubmit = async (values: AnonymousSubmissionFormValues) => {
    if (!submitIdFile) {
      toast.error("Please upload a Submit ID file.");
      return;
    }

    try {
      // 1. Handle file upload to Appwrite Storage via API route
      const formData = new FormData();
      formData.append("file", submitIdFile); // Use 'file' as the key as per the API route example

      // Assuming a dedicated upload route for anonymous submissions, or using a generic one
      // If using a generic one like /api/upload/images, ensure it handles single file uploads and returns the file ID.
      // For now, let's assume a route like /api/upload/anonymous-submission exists or adapt the existing one.
      // Based on the feedback, I'll assume we can adapt the existing /api/upload/images route or a similar pattern.
      // Let's use a hypothetical route for clarity, but note this might need server-side implementation.
      // If /api/upload/images is to be used, its logic might need adjustment to handle different bucket IDs.
      // For now, I'll simulate the upload and getting a file ID. A dedicated route is safer.

      // *** Using a hypothetical dedicated upload route ***
      // const uploadResponse = await fetch('/api/upload/anonymous-submission', {
      //   method: 'POST',
      //   body: formData,
      // });
      // if (!uploadResponse.ok) {
      //   throw new Error('File upload failed.');
      // }
      // const uploadResult = await uploadResponse.json();
      // const fileId = uploadResult.fileId; // Assuming the API returns the file ID

      // *** Alternative: Using the existing /api/upload/images route pattern ***
      // This route expects 'images' as the key and potentially userID/businessId.
      // We need a way to upload a single file for anonymous submission.
      // Let's assume a new route /api/upload/anonymous-submission is the correct approach.
      // Since I cannot create a new API route directly, I will proceed assuming the file upload
      // happens successfully and returns a fileId, and this part needs server-side implementation.
      // For the purpose of completing the form component, I will mock the fileId for now.
      // TODO: Implement the actual file upload API route for anonymous submissions.

      // For now, let's use a placeholder fileId and focus on the tRPC call.
      // A more robust solution would involve creating a dedicated API route for this specific upload.
      // Given the instruction to use the route for handling file uploads, and the example of /api/upload/images,
      // I will assume a similar route exists or can be adapted for anonymous submissions.
      // Let's make a fetch call to a hypothetical route and get the file ID.

      const uploadFormData = new FormData();
      uploadFormData.append("file", submitIdFile); // Key 'file' for a single file upload

      const uploadResponse = await fetch(
        "/api/upload/anonymous-submission-file",
        {
          // Hypothetical route
          method: "POST",
          body: uploadFormData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "File upload failed.");
      }

      const uploadResult = await uploadResponse.json();
      const fileId = uploadResult.fileId; // Assuming the route returns { fileId: string }

      // 2. Generate the "Special code" securely on the server via tRPC mutation
      // The special code generation logic should ideally be on the server for security.
      // The tRPC mutation will handle this.

      // 3. Create a new document in the 'anonymous_submissions' Appwrite collection using tRPC
      const submissionData = {
        name: values.name,
        address: values.address,
        submitIdFileId: fileId,
        title: values.title,
        salaryAccount: values.salaryAccount,
        specialCode: "", // Special code will be generated by the tRPC mutation
      };

      const newSubmission = await createSubmissionMutation.mutateAsync(
        submissionData
      );

      // 4. After successful submission, redirect the user to a verification page URL
      //    that includes the unique ID of the newly created document.
      router.push(`/admin/submissions/${newSubmission.$id}`);

      toast.success("Anonymous submission successful!");
    } catch (error: any) {
      console.error("Anonymous submission error:", error);
      toast.error(
        `Failed to submit the form: ${error.message || "Unknown error"}`
      );
    }
  };

  console.log(form.formState.errors);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, console.log)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Your Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="Marketing Associates" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Submit ID (File Upload)</FormLabel>
          <FormControl>
            <Input type="file" onChange={handleFileChange} />
          </FormControl>
          {submitIdFile && (
            <p className="text-sm text-muted-foreground">
              Selected file: {submitIdFile.name}
            </p>
          )}
          <FormMessage />
        </FormItem>

        {/* Nested Salary Account Fields */}
        <div className="space-y-4 border p-4 rounded">
          <h3 className="text-lg font-semibold">Salary Account Details</h3>
          <FormField
            control={form.control}
            name="salaryAccount.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Holder Name</FormLabel>
                <FormControl>
                  <Input placeholder="Account Holder Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salaryAccount.bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                  <Input placeholder="Bank Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salaryAccount.bankAccount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Account Number</FormLabel>
                <FormControl>
                  <Input placeholder="Bank Account Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Special Code field - will be generated, not user input */}
        {/* <FormField
          control={form.control}
          name="specialCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Code</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <Button type="submit" disabled={createSubmissionMutation.isPending}>
          {createSubmissionMutation.isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default AnonymousSubmissionForm;
