import React from 'react'
import styles from './HeroContent.module.scss'

const HeroContent = () => {
  const logoUrl =
    'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=306,fit=crop,q=95/YNqOjeJqkgtLP0Zw/ember-instruments-ig-white-AzG80ZlJ7es2xvZJ.jpg'
  const description = 'Where traditional craft meets modern design.'
  return (
    <div className={styles.heroContent}>
      <img src={logoUrl} alt='Logo' className={styles.heroContent__logo} />
      <p className={styles.heroContent__description}>{description}</p>
    </div>
  )
}

export default HeroContent
