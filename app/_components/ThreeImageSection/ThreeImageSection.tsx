import React from "react";
import styles from "./ThreeImageSection.module.scss";

interface ImageItem {
  src: string;
  title: string;
  alt?: string;
}

const ThreeImageSection = () => {
  const sectionTitle = "Lorem ipsum dolor";
  const description =
    "Est aliquam viverra mauris tellus bibendum posuere ornare dictum. Sit eget libero id gravida tellus cras mi pretium. Proin tempor vestibulum nullam dictum parturient aliquet vitae et a. ";
  const images = [
    { src: "images/placeholder.png", title: "Dolor sit amet" },
    { src: "images/placeholder.png", title: "Dolor sit amet" },
    { src: "images/placeholder.png", title: "Dolor sit amet" },
  ] as Array<ImageItem>;

  return (
    <section className={styles.threeImageSection}>
      <h2 className={styles.threeImageSection__title}>{sectionTitle}</h2>
      <p className={styles.threeImageSection__description}>{description}</p>
      <hr className={styles.threeImageSection__separator} />
      <div className={styles.threeImageSection__images}>
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
    </section>
  );
};

export default ThreeImageSection;
