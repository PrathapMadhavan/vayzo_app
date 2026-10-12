import NotFoundState from "../components/ui/NotFoundState";

export default function NotFound() {
  return (
    <section className="min-h-full bg-background p-4 sm:p-6 flex items-center justify-center">
      <NotFoundState
        title="404 - Page Not Found"
        message="The page you are looking for does not exist in the VAYZO Admin portal or you may not have sufficient access permissions."
        backPath="/dashboard"
        backLabel="Back to Dashboard"
      />
    </section>
  );
}
