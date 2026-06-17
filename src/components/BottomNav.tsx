"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavIconProps = {
  className?: string;
};

const MeasurementIcon = ({ className }: NavIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={22}
    height={22}
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 12h6" />
    <path d="M9 16h6" />
  </svg>
);

const InterventionIcon = ({ className }: NavIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={22}
    height={22}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M12 5 9 12h6l-3 7" />
  </svg>
);

const SettingsIcon = ({ className }: NavIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={22}
    height={22}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ProfileIcon = ({ className }: NavIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={22}
    height={22}
  >
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </svg>
);

const navItems = [
  { icon: MeasurementIcon, path: "/home/measurements", label: "سنجش" },
  { icon: InterventionIcon, path: "/home/interventions", label: "مداخله" },
  { icon: SettingsIcon, path: "/home/settings", label: "تنظیمات" },
  { icon: ProfileIcon, path: "/home/profile", label: "پروفایل" },
];

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="w-full fixed bottom-0 px-3 pb-4 pt-2 sm:hidden z-40">
      <div className="w-full rounded-2xl bg-white border border-gray-100 shadow-[0_-2px_20px_rgba(70,145,115,0.15)] flex items-center justify-around py-2 px-1">
        {navItems.map((nav) => {
          const isActive = pathname === nav.path;
          const Icon = nav.icon;
          return (
            <Link
              key={nav.path}
              href={nav.path}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${
                isActive ? "bg-primary-soft" : ""
              }`}
            >
              <Icon
                className={`transition-colors ${
                  isActive ? "text-primary" : "text-gray-400"
                }`}
              />
              <span
                className={`text-[10px] font-vazir ${
                  isActive
                    ? "text-primary font-vazir-bold"
                    : "text-gray-400"
                }`}
              >
                {nav.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
