import AnonymousSubmissionForm from "@/components/verifications/anonymous-submission-form";

export default function SubmitPage() {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <AnonymousSubmissionForm />
      </div>
    </div>
  );
}
