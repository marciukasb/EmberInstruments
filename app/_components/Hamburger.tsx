"use client";
import React, { useState } from "react";
import styles from "../../styles/Hamburger.module.scss";

interface Props {
  active: boolean;
  onToggle: any;
}

const Hamburger = (props: Props) => {
  return (
    <div
      className={`${styles.hamburger} ${
        props.active ? styles["hamburger--active"] : ""
      }`}
      onClick={() => props.onToggle()}
    >
      <span></span>
    </div>
  );
};

export default Hamburger;
