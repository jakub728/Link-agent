import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useUserData, useLogout } from "../../hooks/userHooks";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState } from "react";

export default function Navbar() {
  const { isLoggedIn, role } = useUserData();
  const { logout, isLoggingOut } = useLogout();
  const [openNav, setOpenNav] = useState(false);

  return isLoggedIn ? (
    <>
      <nav className={styles.navbar}>
        <div className={styles.big}>
          <NavLink className={styles.navlink} to="/">
            Home
          </NavLink>
          <NavLink className={styles.navlink} to="/generate">
            Generuj
          </NavLink>
          <NavLink className={styles.navlink} to="/history">
            Historia
          </NavLink>
          <NavLink className={styles.navlink} to="/accounts">
            Konta
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
        </div>
      </nav>
      <nav className={styles.small}>
        <GiHamburgerMenu
          onClick={() => {
            setOpenNav(!openNav);
          }}
          className={styles.burger}
        />

        {openNav && (
          <div className={styles.littleNav}>
            <NavLink
              className={styles.littleNavlink}
              to="/"
              onClick={() => {
                setOpenNav(!openNav);
              }}
            >
              Home
            </NavLink>
            <NavLink
              className={styles.littleNavlink}
              to="/generate"
              onClick={() => {
                setOpenNav(!openNav);
              }}
            >
              Generuj
            </NavLink>
            <NavLink
              className={styles.littleNavlink}
              to="/history"
              onClick={() => {
                setOpenNav(!openNav);
              }}
            >
              Historia
            </NavLink>
            <NavLink
              className={styles.littleNavlink}
              to="/accounts"
              onClick={() => {
                setOpenNav(!openNav);
              }}
            >
              Konta
            </NavLink>
            {role === "admin" && (
              <NavLink
                className={styles.littleNavlink}
                to="/admin"
                onClick={() => {
                  setOpenNav(!openNav);
                }}
              >
                Admin
              </NavLink>
            )}
          </div>
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
    </>
  ) : null;
}
