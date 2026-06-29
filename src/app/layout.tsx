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
    <html lang="fa" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#469173" />
      </head>
      <body className="relative bg-gray-50">
        <script>
          window.NAJVA={};var
          s=document.createElement("script");s.src="https://van.najva.com/static/js/main-script.js";s.defer=!0;s.id="najva-mini-script";s.setAttribute("data-najva-id","20361b33-4c25-4731-920d-c629ac0f02d4");document.head.appendChild(s);
        </script>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              fontFamily: "Vazir, sans-serif",
              direction: "rtl",
            },
          }}
        />
        <ReactQueryProvider>
          <UserProvider>
            <div className="w-full h-screen bg-white/90 backdrop-blur-lg absolute hidden sm:flex items-center justify-center z-50">
              <div className="text-center p-8">
                <span className="text-4xl mb-4 block">📱</span>
                <p className="font-vazir text-lg text-gray-700">
                  این نسخه تنها روی دستگاه‌های همراه قابل مشاهده است.
                </p>
              </div>
            </div>
            {children}
          </UserProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
