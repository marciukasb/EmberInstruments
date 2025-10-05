"use client";
import { usePathname } from "next/navigation";

import NavLink from "./NavLink/NavLink";
import styles from "./Navigation.module.scss";
import MobileMenu from "./MobileMenu/MobileMenu";

type Props = {
  pathName: string;
};

const Navigation = () => {
  const showShop = false;
  const pathname = usePathname();
  const showLogo = pathname.startsWith("/blog");

  return (
    <nav className={styles.navigation}>
      <MobileMenu />
      <a href="/" type="acnhor" className={styles.navigation__logo}>
        {showLogo && (
          <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=306,fit=crop,q=95/YNqOjeJqkgtLP0Zw/ember-instruments-ig-white-AzG80ZlJ7es2xvZJ.jpg" />
        )}
      </a>
      <div className={styles.navigation__menu}>
        <NavLink href="/" name="Home" />
        <NavLink href="/about" name="About" />
        <NavLink href="/blog" name="Blog" />
        <NavLink href="/contacts" name="Contacts" />
        {showShop && (
          <NavLink
            href="https://emberinstruments.shop"
            name="Shop"
            type="anchor"
          />
        )}
      </div>
    </nav>
  );
};

export default Navigation;
