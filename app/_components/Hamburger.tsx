"use client";
import React, { useState } from "react";
import styles from "../../styles/Hamburger.module.scss";

interface Props {
  onToggle: any;
}

const Hamburger = (props: Props) => {
  const [active, setActive] = useState(false);

  return (
    <div
      className={`${styles.hamburger} ${
        active ? styles["hamburger--active"] : ""
      }`}
      onClick={() => {
        props.onToggle();
        setActive(!active);
      }}
    >
      <span></span>
    </div>
  );
};

export default Hamburger;
