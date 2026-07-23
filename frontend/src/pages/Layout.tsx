import { Outlet } from "react-router-dom";
import "../index.css";
import Navbar from "../components/Navbar/Navbar";
import SatkurierAI from "../assets/Satkurier.png";

export default function Layout() {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <h1>SAT Kurier </h1>
        <img src={SatkurierAI} className="skimage" />
      </div>
      <header>
        <Navbar />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
