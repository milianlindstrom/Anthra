import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GlobalSearch } from "@/components/global-search";
import { Sidebar } from "@/components/sidebar";
import { ProjectProvider } from "@/contexts/project-context";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { QuickAddInput } from "@/components/quick-add-input";
import { DarkModeToggle } from "@/components/dark-mode-toggle";

const ibmPlexSans = IBM_Plex_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans",
});

const jetBrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});



export const metadata: Metadata = {
  title: "Anthra",
  description: "A minimal task management system",
  icons: {
    icon: '/ulriklogo.svg',
    shortcut: '/ulriklogo.svg',
    apple: '/ulriklogo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${ibmPlexSans.variable} ${jetBrainsMono.variable} font-sans`}>
        <ProjectProvider>
          <div className="min-h-screen flex">
            <Sidebar className="hidden md:flex shrink-0" />
            <MobileSidebar />
            <main className="flex-1 overflow-auto pt-16 md:pt-0">
              {children}
            </main>
            <div className="fixed top-4 right-4 z-50">
              <DarkModeToggle />
            </div>
            <GlobalSearch />
            <KeyboardShortcuts />
            <QuickAddInput />
          </div>
        </ProjectProvider>
      </body>
    </html>
  );
}
