"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const navlinks = [
  { name: "Home", href: "#home" },
  { name: "Works", href: "#works" },
  { name: "Experience", href: "#experience" },
  { name: "Achievements", href: "#achievements" },
];

export const Navbar = () => {
  return (
    <div className=" md:block sticky top-0 z-20 rounded-none py-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="flex items-center justify-end px-4">
        <div className="flex items-end gap-4">
          <div className="flex items-center justify-center gap-4">
            {navlinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-neutral-500 dark:text-neutral-400 text-[11px] font-extrabold font-mono uppercase tracking-tight hover:text-neutral-900 dark:hover:text-neutral-100 transition-all duration-300 ease-in"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
