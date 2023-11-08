"use client";
import React, { useState } from "react";
import styles from "../../styles/MobileMenu.module.scss";
import Hamburger from "./Hamburger";
import NavLink from "./NavLink";

const MobileMenu = () => {
  const [active, setActive] = useState(false);

  return (
    <div className={styles.mobileMenu}>
      <Hamburger active={active} onToggle={() => setActive(!active)} />
      <div
        className={`${styles.mobileMenu__select} ${
          active ? styles["mobileMenu__select--open"] : ""
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
      {active && (
        <div
          className={styles.mobileMenu__overlay}
          onClick={() => setActive(false)}
        ></div>
      )}
    </div>
  );
};

export default MobileMenu;
