import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ErrorProbe from "@/components/ErrorProbe";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mtboss.cn"),
  title: {
    default: "CopyBoss — AI Copywriter for Instagram, TikTok, LinkedIn & X",
    template: "%s · CopyBoss",
  },
  description:
    "CopyBoss is an AI copywriting tool: describe your product once and get ready-to-publish social media copy for Instagram, TikTok, LinkedIn, X and YouTube in 30 seconds. Free to try.",
  keywords: [
    "AI copywriter",
    "AI copywriting tool",
    "Instagram caption generator",
    "TikTok script generator",
    "LinkedIn post generator",
    "social media copy generator",
    "marketing copy AI",
    "AI writing assistant",
  ],
  openGraph: {
    title: "CopyBoss — AI Copywriter for Every Platform",
    description:
      "Describe your product once. Get ready-to-publish copy for Instagram, TikTok, LinkedIn, X and YouTube in 30 seconds.",
    url: "https://mtboss.cn",
    siteName: "CopyBoss",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CopyBoss — AI Copywriter for Every Platform",
    description: "Describe your product once, get publish-ready social copy in 30 seconds.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Providers 包住整个应用，让 useSession() 在任何组件里都能用 */}
        <Providers>
          <ErrorProbe />
          <Nav />
          {children}
          <Footer />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
