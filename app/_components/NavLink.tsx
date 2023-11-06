"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import styles from "../../styles/NavLink.module.scss";

interface Props {
  href: string;
  name: string;
  type?: string;
}

const NavLink = (props: Props) => {
  const pathname = usePathname();
  const isActive = pathname === props.href;
  return (
    <div
      className={`${styles.navlink} ${isActive && styles["navlink--active"]}`}
    >
      {props.type !== "anchor" && <Link href={props.href}>{props.name}</Link>}
      {props.type === "anchor" && <a href={props.href}>{props.name}</a>}
    </div>
  );
};

export default NavLink;
