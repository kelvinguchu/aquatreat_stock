import { Poppins } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import AuthWrapper from "@/components/AuthWrapper";
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Aquatreat Stock Management",
  description: "Stock Management System",
  icons: {
    icon: "/favi.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${poppins.className} antialiased bg-[#E0F0FF]`}>
        <AuthWrapper>{children}</AuthWrapper>
        <Toaster />
      </body>
    </html>
  );
}
