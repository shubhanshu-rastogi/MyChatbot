import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shubhanshu Rastogi | Personal AI Assistant",
  description:
    "Premium recruiter-facing AI profile for Shubhanshu Rastogi with an agentic chatbot shell.",
  metadataBase: new URL("https://shubhanshurastogi.it.com")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
