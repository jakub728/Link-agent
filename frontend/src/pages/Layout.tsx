import { Outlet } from "react-router-dom";
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
        <h1>Satkurier </h1>
        <img
          src={SatkurierAI}
          style={{ backgroundColor: "white", height: "36px", width: "36px" }}
        />
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
