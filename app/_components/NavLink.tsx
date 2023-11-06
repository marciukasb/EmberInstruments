"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface Props {
  href: string;
  name: string;
}

const NavLink = (props: Props) => {
  const pathname = usePathname();

  return (
    <div>
      <Link
        className={`link ${pathname === "/" ? "active" : ""}`}
        href={props.href}
      >
        {props.name}
      </Link>
    </div>
  );
};

export default NavLink;
