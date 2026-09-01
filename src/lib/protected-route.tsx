export function ProtectedRoute({ allowedRoles, children }: {
  allowedRoles?: string[];
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
