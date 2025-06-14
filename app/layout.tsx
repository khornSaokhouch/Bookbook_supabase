import "@/app/globals.css";
import { Metadata } from "next";
import { Inter, Noto_Sans_Khmer } from "next/font/google";

// Load Inter and Noto Sans Khmer fonts
const inter = Inter({ subsets: ["latin"] });
const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "700"],
});

// Page metadata
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
        <main>{children}</main>
      </body>
    </html>
  );
}
