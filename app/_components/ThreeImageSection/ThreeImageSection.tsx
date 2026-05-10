"use client";

import React, { useRef, useState, useEffect } from "react";
import styles from "./ThreeImageSection.module.scss";

interface ImageItem {
  src: string;
  title: string;
  alt?: string;
}

const ThreeImageSection = () => {
  const sectionTitle = "Built by hand. Made to play.";
  const description =
    "At Ember Instruments, every electric guitar and bass is crafted one at a time — by hand, with care, and with musicians in mind. No shortcuts, no assembly lines. Just instruments made the way they should be.";
  const images: ImageItem[] = [
    { src: "images/placeholder.png", title: "Craftsmanship" },
    { src: "images/placeholder.png", title: "Materials" },
    { src: "images/placeholder.png", title: "Sound" },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const items = containerRef.current.querySelectorAll(
      `.${styles.threeImageSection__imageItem}`
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(items).indexOf(entry.target as Element);
            setActiveIndex(index);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5, // half visible
      }
    );

    items.forEach((item) => observer.observe(item));

    return () => {
      items.forEach((item) => observer.unobserve(item));
    };
  }, []);

  return (
    <section className={styles.threeImageSection}>
      <h2 className={styles.threeImageSection__title}>{sectionTitle}</h2>
      <p className={styles.threeImageSection__description}>{description}</p>
      <hr className={styles.threeImageSection__separator} />

      <div>
        <div className={styles.threeImageSection__images} ref={containerRef}>
          {images.map((image, index) => (
            <div key={index} className={styles.threeImageSection__imageItem}>
              <img
                src={image.src}
                alt={image.alt || image.title}
                className={styles.threeImageSection__image}
              />
              <p className={styles.threeImageSection__imageTitle}>
                {image.title}
              </p>
            </div>
          ))}
        </div>

        {/* Dots for mobile */}
        <div className={styles.threeImageSection__dots}>
          {images.map((_, index) => (
            <span
              key={index}
              className={`${styles.threeImageSection__dot} ${
                activeIndex === index
                  ? styles["threeImageSection__dot--active"]
                  : ""
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThreeImageSection;
