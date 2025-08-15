import NavLink from "./NavLink/NavLink";
import styles from "./Navigation.module.scss";
import MobileMenu from "./MobileMenu/MobileMenu";

const Navigation = () => {
  const showShop = false;

  return (
    <nav className={styles.navigation}>
      <MobileMenu />

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
