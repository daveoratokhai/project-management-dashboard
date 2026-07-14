import { LoginButton } from "@/components/login-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message =
    error === "not-allowed"
      ? "That account isn't allowed to access this dashboard. Ask an admin to add you."
      : error
        ? "Sign-in failed. Please try again."
        : "";

  return (
    <main className="flex min-h-[70vh] w-full items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-semibold text-foreground">Project Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to continue.
        </p>
        {message && (
          <p className="mt-4 rounded-md border border-red-600/40 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {message}
          </p>
        )}
        <div className="mt-6">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
