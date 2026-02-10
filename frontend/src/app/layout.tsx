import ClientShell from "./ClientShilt"; // import ClientShell
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "True Ownership for Creators and their communities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-100 dark:bg-gray-950" suppressHydrationWarning>
        <Providers>
          <ClientShell>
            {children} {/* Ensure children are passed down correctly */}
          </ClientShell>
        </Providers>
      </body>
    </html>
  );
}
