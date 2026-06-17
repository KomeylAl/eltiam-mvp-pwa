"use client";

import icons, { iconFill } from "@/utils/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navIcons = [
  {
    icon: icons.measurement,
    iconFill: iconFill.measurementFill,
    path: "/home/measurements",
  },
  {
    icon: icons.intervention,
    iconFill: iconFill.interventionFill,
    path: "/home/interventions",
  },
  { icon: icons.setting, iconFill: iconFill.settingFill, path: "/home/settings" },
  { icon: icons.user, iconFill: iconFill.userFill, path: "/home/profile" },
];

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="w-full h-20 fixed bottom-0 px-4 py-3 sm:hidden">
      <div className="w-full h-full rounded-full bg-[#469173] flex items-center justify-around p-4">
        {navIcons.map((nav) => (
          <Link key={nav.path} href={nav.path}>
            <Image
              src={pathname === nav.path ? nav.iconFill : nav.icon}
              alt=""
              width={25}
              height={25}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
