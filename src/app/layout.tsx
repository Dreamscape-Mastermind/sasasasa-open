import "./globals.css";

import { Anton, Sen } from "next/font/google";

import Footer from "@/components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import Header from "@/components/Header";
import { Metadata } from "next";
import Providers from "@/components/providers/query-provider";
import SectionContainer from "@/components/SectionContainer";
import { Sidebar } from "@/components/Sidebar";
import siteMetadata from "@/config/siteMetadata";

// import localFont from "next/font/local";

// const geist = localFont({
//   src: "../assets/fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
// });
// const geist = localFont({
//   src: "../assets/fonts/GeistVF.woff",
//   variable: "--font-geist",
// });

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
        className={`${sen.variable} ${anton.variable} antialiased "bg-white pl-[calc(100vw-100%)] text-black dark:bg-gray-950 dark:text-white`}
      >
        <Providers>
          <SectionContainer>
            <Header />
            {children}
            <Footer />
            <Sidebar />
          </SectionContainer>
        </Providers>
      </body>
      <GoogleAnalytics gaId={siteMetadata.googleAnalyticsId} />
    </html>
  );
}
