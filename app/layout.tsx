import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import ChatBotUI from "@/components/ChatBotUI";

export const metadata: Metadata = {
  title: "Safe Report - Crowdsourced Disaster Reporting",
  description:
    "Empowering communities to report and respond to disasters effectively.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="relative min-h-screen bg-black selection:bg-sky-500/20">
            {/* Gradient Background */}
            <div className="fixed inset-0 -z-10 min-h-screen">
              <div className="absolute inset-0 h-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03),transparent_50%)]" />
              <div className="absolute inset-0 h-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.04),transparent_70%)]" />
            </div>
            <Toaster />
            <Navbar />
            <main className="pt-16">{children}</main>
            <ChatBotUI />
          </div>
        </Providers>
      </body>
    </html>
  );
}
