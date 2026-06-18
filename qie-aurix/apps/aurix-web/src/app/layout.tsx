import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "QIE Aurix — Financial Resilience Guardian",
  description:
    "AI-powered decentralized financial resilience guardian. One Identity. One AI Guardian. Continuous Financial Protection Across Chains.",
  keywords: ["QIE", "DeFi", "resilience", "protection", "guardian", "Web3", "AI"],
  openGraph: {
    title: "QIE Aurix — Financial Resilience Guardian",
    description: "One Identity. One AI Guardian. Continuous Financial Protection Across Chains.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
