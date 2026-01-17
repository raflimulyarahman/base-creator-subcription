import ClientShell from "./ClientShilt"; // import ClientShell
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Base Indonesia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white">
        <Providers>
          <ClientShell>
            {children}  {/* children sekarang dibungkus ClientShell */}
          </ClientShell>
        </Providers>
      </body>
    </html>
  );
}
