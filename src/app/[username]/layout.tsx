import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function UserLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href={`/${username}/manifest`} />
        <meta name="theme-color" content="#f97316" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
