import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "PollRoom — Real-Time Polls",
  description:
    "Create instant polls, share a link, and watch votes come in live. No sign-up required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased min-h-screen bg-background"
      >

        {/* Header */}
        <header className="relative z-10 px-[clamp(1rem,5vw,3.5rem)] py-[clamp(1.5rem,3vw,2rem)]">
          <a href="/" className="inline-block">
            <span
              className="font-extrabold tracking-tight text-foreground"
              style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5625rem)" }}
            >
              PollRoom.
            </span>
          </a>
        </header>

        {/* Main content */}
        <main className="relative z-10 px-[clamp(1rem,5vw,3.5rem)] pb-[clamp(2rem,5vw,4rem)]">
          <div className="mx-auto max-w-2xl">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-border px-[clamp(1rem,5vw,3.5rem)] py-[clamp(1.5rem,3vw,2rem)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 max-w-2xl mx-auto">
            <span className="font-extrabold text-sm tracking-tight">PollRoom.</span>
            <span className="text-muted-foreground font-light text-xs tracking-wide">
              &copy; {new Date().getFullYear()} All rights reserved.
            </span>
          </div>
        </footer>

        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
