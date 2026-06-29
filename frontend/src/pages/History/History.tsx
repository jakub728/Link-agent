import { useGetHistory, useScrapeLink } from "../../hooks/generateHooks";
import style from "./History.module.css";
import {
  FaFacebook,
  FaLinkedin,
  FaTwitterSquare,
  FaRedditSquare,
  FaTelegram,
} from "react-icons/fa";
import { IoLogoDiscord, IoCopyOutline } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import wykop from "../../assets/Wykop.png";
import { useState } from "react";
import ResultsView from "../../components/PostProposal/ResultProposal";

export default function History() {
  const { data: history, isLoading, isError, error } = useGetHistory();
  const [openView, setOpenView] = useState(false);

  if (isLoading) {
    return <div>Ładowanie historii...</div>;
  }

  if (isError) {
    return (
      <div>
        Wystąpił błąd:{" "}
        {error instanceof Error ? error.message : "Nieznany błąd"}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return <div>Brak wpisów w historii</div>;
  }

  console.log(history);

  return (
    <div className={style.container}>
      <h2>Historia generowań</h2>
      <div>
        {history.map((post) => (
          <div key={post._id} className={style.post}>
            <h3>{post.title}</h3>
            <img
              src={`http://localhost:5000/public${post.imageUrl}`}
              alt="foto"
            />
            <p>{post.link}</p>
            <IoCopyOutline size={24} />
            <h3>Opublikuj</h3>
            {!openView && (
              <div className={style.buttons}>
                <button disabled={history[0]?.facebook.uploaded}>
                  <FaFacebook
                    size={24}
                    color={
                      !history[0]?.facebook.uploaded ? "#1877F2" : "#9CA3AF"
                    }
                  />
                </button>
                <button disabled={history[0]?.linkedin.uploaded}>
                  <FaLinkedin size={24} color="#0A66C2" />
                </button>
                <button disabled={history[0]?.reddit.uploaded}>
                  <FaRedditSquare size={24} color="#FF4500" />
                </button>
                <button disabled={history[0]?.telegram.uploaded}>
                  <FaTelegram size={24} color="#26A5E4" />
                </button>
                <button disabled={history[0]?.discord.uploaded}>
                  <IoLogoDiscord size={24} color="#5865F2" />
                </button>
                <button disabled={history[0]?.wykop.uploaded}>
                  <img
                    src={wykop}
                    alt="Wykop"
                    style={{ width: 25, height: 25, objectFit: "contain" }}
                  />
                </button>
                <button
                  onClick={() => {
                    setOpenView(true);
                  }}
                >
                  <IoIosArrowDown size={24} color="#000000" />
                </button>
              </div>
            )}
            <div style={{ maxWidth: "1400px", width: "100%", margin: "auto" }}>
              {openView && (
                <>
                  {" "}
                  <button
                    onClick={() => {
                      setOpenView(false);
                    }}
                  >
                    <IoIosArrowUp size={24} color="#000000" />
                  </button>
                  <ResultsView data={history[0]} />
                </>
              )}
            </div>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}
