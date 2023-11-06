import NavLink from "./NavLink";

const Navigation = () => {
  return (
    <nav>
      <ul>
        <li>
          <NavLink href="/" name="Home" />
        </li>
        <li>
          <NavLink href="/about" name="About" />
        </li>
        <li>
          <NavLink href="/blog" name="Blog" />
        </li>
        <li>
          <NavLink href="/contacts" name="Contacts" />
        </li>
        <li>
          <a href="http://emberinstruments.shop/">Shop</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
