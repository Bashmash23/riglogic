import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { ConfirmDialogHost } from "@/components/ConfirmDialog";
import { CommandPalette } from "@/components/CommandPalette";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RigLogic — The smart gear list for UAE productions",
  description:
    "Build a gear list once, send it to anyone, rent it anywhere. Smart-Match compatibility for UAE film and video productions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
          {children}
          {/* Floating toast stack. Dark theme to match the app,
              positioned bottom-right so it doesn't fight with the
              sticky save bar on /crew/me (which sits bottom-left). */}
          <Toaster
            position="bottom-right"
            theme="dark"
            richColors
            closeButton
          />
          {/* Imperative confirm() dialog host — replaces the native
              browser confirm with a styled Radix AlertDialog. */}
          <ConfirmDialogHost />
          {/* Global Cmd+K palette. Mounted once so the shortcut
              works from any page. */}
          <CommandPalette />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
