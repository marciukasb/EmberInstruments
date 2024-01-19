import NavLink from "./NavLink";
import styles from "../../styles/Navigation.module.scss";
import MobileMenu from "./MobileMenu";

const Navigation = () => {
  const showShop = false;

  return (
    <nav className={styles.navigation}>
      <MobileMenu />

      <NavLink href="/" type="acnhor">
        <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=306,fit=crop,q=95/YNqOjeJqkgtLP0Zw/ember-instruments-ig-white-AzG80ZlJ7es2xvZJ.jpg" />
      </NavLink>
      <div className={styles.navigation__menu}>
        <NavLink href="/" name="Home" />
        <NavLink href="/about" name="About" />
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
