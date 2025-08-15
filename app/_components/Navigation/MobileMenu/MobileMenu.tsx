"use client";
import React, { useEffect, useState } from "react";
import styles from "./MobileMenu.module.scss";
import { usePathname } from "next/navigation";
import Hamburger from "../Hambburger/Hamburger";
import NavLink from "../NavLink/NavLink";

const MobileMenu = () => {
  const [active, setActive] = useState(false);
  const location = usePathname();

  useEffect(() => {
    setActive(false);
  }, [location]);

  return (
    <div className={styles.mobileMenu}>
      {/* Hamburger stays on top */}
      <Hamburger active={active} onToggle={() => setActive(!active)} />

      {/* Fullscreen menu */}
      <div
        className={`${styles.mobileMenu__fullscreen} ${
          active ? styles["mobileMenu__fullscreen--open"] : ""
        }`}
      >
        <NavLink href="/" name="Home" />
        <NavLink href="/about" name="About" />
        <NavLink href="/contacts" name="Contacts" />
        <NavLink
          href="https://emberinstruments.shop"
          name="Shop"
          type="anchor"
        />
      </div>

      {/* Overlay behind the menu */}
      {active && (
        <div
          className={styles.mobileMenu__overlay}
          onClick={() => setActive(false)}
        />
      )}
    </div>
  );
};

export default MobileMenu;
