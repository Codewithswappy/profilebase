export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-background p-4">
      <div className="w-full max-w-md space-y-8">{children}</div>
    </div>
  );
}
