import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useUserData, useLogout } from "../../hooks/userHooks";

export default function Navbar() {
  const { isLoggedIn, role } = useUserData();
  const { logout, isLoggingOut } = useLogout();

  return isLoggedIn ? (
    <nav>
      <NavLink className={styles.navlink} to="/">
        Home
      </NavLink>
      <NavLink className={styles.navlink} to="/generate">
        Generuj
      </NavLink>
      <NavLink className={styles.navlink} to="/history">
        Historia
      </NavLink>
      {role === "admin" && (
        <NavLink className={styles.navlink} to="/admin">
          Admin
        </NavLink>
      )}
      <button
        className={styles.button}
        onClick={() => {
          logout();
        }}
        disabled={isLoggingOut}
      >
        Wyloguj
      </button>
    </nav>
  ) : null;
}
