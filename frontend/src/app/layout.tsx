import "./globals.css";
import Providers from "./providers";
export const metadata = { title: "Base Education" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
