/**
 * Public marketing shell — no sidebar, no auth guard, no clinic gate.
 * Everything under `(public)` is reachable by anonymous visitors.
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex min-h-screen flex-col bg-background">{children}</div>;
}
