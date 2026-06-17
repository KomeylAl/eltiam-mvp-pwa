import Image from "next/image";
import "../globals.css";
import images from "@/utils/images";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-screen relative">
      <Image
        src={images.loginBack}
        alt=""
        width={300}
        height={800}
        className="w-full h-full object-cover absolute -z-10"
      />
      {children}
    </div>
  );
}
