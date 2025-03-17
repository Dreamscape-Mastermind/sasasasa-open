import "./globals.css";

import { Anton, Sen } from "next/font/google";

import { AuthProvider } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import Header from "@/components/Header";
import { Metadata } from "next";
import Providers from "@/components/providers/query-provider";
import SectionContainer from "@/components/SectionContainer";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProviders } from "@/components/providers/theme-providers";
import { Toaster } from "react-hot-toast";
import siteMetadata from "@/data/siteMetadata";

const sen = Sen({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sen",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: "./",
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: siteMetadata.title,
    card: "summary_large_image",
    images: [siteMetadata.socialBanner],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const basePath = process.env.BASE_PATH || "";
  return (
    <html lang={siteMetadata.language} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href={siteMetadata.favicon.apple} />
        {siteMetadata.favicon.icon.map((icon) => (
          <link
            key={icon.url}
            rel="icon"
            href={icon.url}
            type={icon.type}
            sizes={icon.sizes}
          />
        ))}
      </head>
      <body
        className={`${sen.variable} ${anton.variable} antialiased bg-white text-black dark:bg-gray-950 dark:text-white`}
      >
        <AuthProvider>
          <ThemeProviders>
            <Providers>
              {!children?.toString().includes('DashboardLayout') ? (
                <SectionContainer>
                  <Header />
                  <main className="mb-auto">{children}</main>
                  <Footer />
                  <Sidebar />
                  <Toaster />
                </SectionContainer>
              ) : (
                <>
                  {children}
                  <Toaster />
                </>
              )}
            </Providers>
          </ThemeProviders>
        </AuthProvider>
      </body>
      <GoogleAnalytics gaId={siteMetadata.googleAnalyticsId} />
    </html>
  );
}
