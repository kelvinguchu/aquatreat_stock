"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Logout from "@/components/Logout";
import { usePathname, useRouter } from 'next/navigation';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (!user && !isAuthPage()) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      const timeout = setTimeout(() => {
        auth.signOut();
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearTimeout(timeout);
    }
  }, [user]);

  const isAuthPage = () => {
    return pathname === '/login' || pathname === '/signup';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user && !isAuthPage()) {
    return null; // Prevent rendering of protected content while redirecting
  }

  return (
    <html lang='en'>
      <body className={`${poppins.className} antialiased bg-[#E0F0FF]`}>
        {user && !isAuthPage() ? (
          <>
            <Navbar />
            <div className="flex justify-end p-4">
              <Logout />
            </div>
            {children}
          </>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
