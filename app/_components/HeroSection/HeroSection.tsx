"use client";

import React, { useState, useEffect } from "react";
import styles from "./HeroSection.module.scss";

interface HeroSectionProps {
  imageUrl: string; // Desktop / default image
  mobileImageUrl?: string; // Optional mobile image
  children?: React.ReactNode;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  imageUrl,
  mobileImageUrl,
  children,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentImage, setCurrentImage] = useState(imageUrl);

  useEffect(() => {
    const handleResize = () => {
      if (mobileImageUrl && window.innerWidth <= 920) {
        setCurrentImage(mobileImageUrl);
        setIsMobile(true);
      } else {
        setCurrentImage(imageUrl);
        setIsMobile(false);
      }
    };

    handleResize(); // check on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [imageUrl, mobileImageUrl]);

  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url(${currentImage})` }}
    >
      <div className={styles.hero__overlay}>
        {!isMobile && <div className={styles.hero__content}>{children}</div>}
      </div>
    </section>
  );
};

export default HeroSection;
