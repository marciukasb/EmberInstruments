"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import styles from "../../styles/NavLink.module.scss";

interface Props {
  href: string;
  name?: string;
  type?: string;
  children?: React.ReactNode;
}

const NavLink = (props: Props) => {
  const isActive = usePathname() === props.href;

  const renderLinks = () => {
    if (props.type === "anchor") return <a href={props.href}>{props.name}</a>;
    return <Link href={props.href}>{props.name ?? props.children}</Link>;
  };
  return (
    <div
      className={`${styles.navlink} ${isActive && styles["navlink--active"]}`}
    >
      {renderLinks()}
    </div>
  );
};

export default NavLink;
