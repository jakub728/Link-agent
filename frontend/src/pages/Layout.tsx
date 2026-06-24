import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";

export default function Layout() {
  return (
    <>
      <h1>SI Satkurier generator</h1>
      <header>
        <Navbar />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
