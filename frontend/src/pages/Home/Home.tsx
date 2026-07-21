import style from "./Home.module.css";
import { useUserData } from "../../hooks/userHooks";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user } = useUserData();
  const navigate = useNavigate();

  return (
    <>
      <h1 style={{ marginTop: "100px" }}>Witaj z powrotem {user?.login}!</h1>
      <div className={style.container}>
        <button
          className={style.navButton}
          onClick={() => navigate("/accounts")}
        >
          <span>1. Dodaj konta →</span>
        </button>

        <button
          className={style.navButton}
          onClick={() => navigate("/generate")}
        >
          <span>2. Generuj →</span>
        </button>

        <button
          className={style.navButton}
          onClick={() => navigate("/history")}
        >
          <span>3. Historia →</span>
        </button>
      </div>
    </>
  );
}
