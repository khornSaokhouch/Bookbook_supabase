// app/layout.tsx (This file should NOT have "use client")
import "@/app/globals.css";
import { Metadata } from "next";
import { Inter, Noto_Sans_Khmer } from "next/font/google";
import ProvidersWrapper from "@/app/components/ProvidersWrapper"; // Import the new wrapper Client Component

// Load Inter and Noto Sans Khmer fonts
const inter = Inter({ subsets: ["latin"] });
const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "700"],
});

// Page metadata (This stays here because layout.tsx is a Server Component)
export const metadata: Metadata = {
  title: "Cookbooks",
  description: "Website description",
  icons: {
    icon: [
      {
        rel: "icon",
        sizes: "any",
        url: "/logo.png",
        href: "/logo.png",
      },
    ],
  },
};

// Root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km" className={notoSansKhmer.className}>
      <head>
        {/* Material Icons (optional) */}
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.className} ${notoSansKhmer.className} antialiased bg-white text-gray-900`}
      >
        {/* This div is the target for your alerts rendered via createPortal */}
        <div id="alert-root"></div>

        {/* Wrap your main application content with the ProvidersWrapper */}
        <ProvidersWrapper>
          <main>{children}</main>
        </ProvidersWrapper>
      </body>
    </html>
  );
}