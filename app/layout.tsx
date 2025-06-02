import "@/app/globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.className} antialiased bg-white text-gray-900`}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}
