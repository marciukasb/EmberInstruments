"use client";
import React, { useState } from "react";
import styles from "../../styles/Hamburger.module.scss";

const Hamburger = () => {
  const [active, setActive] = useState(false);

  return (
    <div
      className={`${styles.hamburger} ${
        active ? styles["hamburger--active"] : ""
      }`}
      onClick={() => setActive(!active)}
    >
      <span></span>
    </div>
  );
};

export default Hamburger;
