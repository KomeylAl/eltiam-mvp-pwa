import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { UserProvider } from "@/contexts/UserContext";

export const metadata: Metadata = {
  title: "التیام",
  description: "تجربه زندگی ارزشمند",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="relative">
        <Toaster />
        <ReactQueryProvider>
          <UserProvider>
            <div className="w-full h-screen bg-white/80 backdrop-blur-lg absolute hidden sm:flex items-center justify-center">
              <p>این نسخه تنها روی دستگاه های همراه قابل مشاهده است.</p>
            </div>
            {children}
          </UserProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
