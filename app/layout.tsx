import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalSearch } from "@/components/global-search";
import { Sidebar } from "@/components/sidebar";
import { ProjectProvider } from "@/contexts/project-context";
import { MobileSidebar } from "@/components/mobile-sidebar";

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
        <ProjectProvider>
          <div className="min-h-screen flex">
            <Sidebar className="hidden md:flex w-64 shrink-0" />
            <MobileSidebar />
            <main className="flex-1 overflow-auto pt-16 md:pt-0">
              {children}
            </main>
            <GlobalSearch />
          </div>
        </ProjectProvider>
      </body>
    </html>
  );
}
