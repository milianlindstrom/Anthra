import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ulrik",
  description: "A minimal task management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex items-center gap-6">
                <Link href="/kanban" className="text-xl font-bold">
                  Ulrik
                </Link>
                <div className="flex gap-4">
                  <Link
                    href="/kanban"
                    className="text-sm hover:text-primary transition-colors"
                  >
                    Kanban
                  </Link>
                  <Link
                    href="/gantt"
                    className="text-sm hover:text-primary transition-colors"
                  >
                    Gantt
                  </Link>
                </div>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
