import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { QueryProvider } from "./query-provider";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bunchify",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
