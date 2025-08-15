import React from "react";
import styles from "./InfoSection.module.scss";

interface InfoSectionProps {
  title: string;
  description: string;
  imageUrl: string;
  reverse?: boolean; // when true, swaps image and text
}

const InfoSection: React.FC<InfoSectionProps> = ({
  title,
  description,
  imageUrl,
  reverse = false,
}) => {
  return (
    <section
      className={`${styles.infoSection} ${
        reverse ? styles["infoSection--reverse"] : ""
      }`}
    >
      <div className={styles.infoSection__text}>
        <h2 className={styles.infoSection__title}>{title}</h2>
        <p className={styles.infoSection__description}>{description}</p>
      </div>
      <div className={styles.infoSection__imageWrapper}>
        <img src={imageUrl} alt={title} className={styles.infoSection__image} />
      </div>
    </section>
  );
};

export default InfoSection;
