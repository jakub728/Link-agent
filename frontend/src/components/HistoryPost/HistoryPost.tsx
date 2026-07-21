import style from "./HistoryPost.module.css";
import { type GeneratedPost } from "../../types/generatedTypes";
import { useState } from "react";
import wykop from "../../assets/Wykop.png";
import {
  FaFacebook,
  FaLinkedin,
  FaTelegram,
  FaReddit,
  FaDiscord,
  FaShareAlt,
  FaEye,
} from "react-icons/fa";
import { IoLogoDiscord, IoCopyOutline, IoCheckmark } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { formatDateCompact } from "../../utils/formatDate";
import { useUserFromId } from "../../hooks/userHooks";
import ResultsView from "../../components/PostProposal/ResultProposal";

interface HistoryPost {
  post: GeneratedPost;
}

const PLATFORMS = [
  {
    key: "facebook",
    label: "Facebook",
    icon: <FaFacebook size={18} color="#1877F2" />,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: <FaLinkedin size={18} color="#0A66C2" />,
  },
  {
    key: "reddit",
    label: "Reddit",
    icon: <FaReddit size={18} color="#FF4500" />,
  },
  {
    key: "wykop",
    label: "Wykop",
    icon: <img src={wykop} alt="Wykop" className={style.wykopIconSmall} />,
  },
  {
    key: "discord",
    label: "Discord",
    icon: <FaDiscord size={18} color="#5865F2" />,
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: <FaTelegram size={18} color="#26A5E4" />,
  },
] as const;

export default function HistoryPost({ post: Post }: HistoryPost) {
  const [openShares, setOpenShares] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const UserLabel = ({ id }: { id: string }) => {
    const { userName } = useUserFromId(id);

    if (!userName) return <span>Nieznany użytkownik</span>;
    return <span>{userName}</span>;
  };

  const handleCopyLink = () => {
    if (!Post.link) return;
    navigator.clipboard.writeText(Post.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const allShares = PLATFORMS.flatMap((platform) => {
    const uploadedList = Post[platform.key]?.uploaded || [];
    return uploadedList.map((item) => ({
      platformKey: platform.key,
      platformLabel: platform.label,
      icon: platform.icon,
      accountName: item.accountName,
      createdAt: item.createdAt,
      id: `${platform.key}-${item.createdAt}`,
    }));
  });

  return (
    <div className={style.card}>
      {/* NAGŁÓWEK I GŁÓWNE INFO */}
      <div className={style.header}>
        <div className={style.metaInfo}>
          <h3 className={style.title}>{Post.title || "Bez tytułu"}</h3>
          <div className={style.dates}>
            <span>
              Utworzono: <strong>{formatDateCompact(Post.createdAt)}</strong>
            </span>
            {formatDateCompact(Post.createdAt) !==
              formatDateCompact(Post.updatedAt) && (
              <span>
                {" "}
                | Edycja: <strong>{formatDateCompact(Post.updatedAt)}</strong>
              </span>
            )}
            <span>
              {" "}
              | Wygenerował:{" "}
              <strong>
                <UserLabel id={Post.author} />
              </strong>
            </span>
          </div>
        </div>

        {Post.link && (
          <button
            onClick={handleCopyLink}
            className={style.copyBtn}
            title="Kopiuj link"
          >
            {copied ? (
              <IoCheckmark color="#10B981" size={18} />
            ) : (
              <IoCopyOutline size={18} />
            )}
            <span>{copied ? "Skopiowano" : "Kopiuj link"}</span>
          </button>
        )}
      </div>

      {/* MID SECTION: SZYBKIE AKCJE SOCIAL & GLÓWNY OBRAZEK */}
      <div className={style.body}>
        {Post.imageUrl && (
          <div className={style.imageWrapper}>
            <img
              src={`https://ai.sulisz.pl/public${Post.imageUrl}`}
              alt="Post thumbnail"
              className={style.image}
            />
          </div>
        )}

        <div className={style.quickSocials}>
          <span className={style.quickSocialsLabel}>Status udostępnień:</span>
          <div className={style.socialIconsGroup}>
            <FaFacebook
              size={22}
              color={Post.facebook?.uploaded?.length ? "#1877F2" : "#D1D5DB"}
            />

            <FaLinkedin
              size={22}
              color={Post.linkedin?.uploaded?.length ? "#0A66C2" : "#D1D5DB"}
            />

            <FaReddit
              size={22}
              color={Post.reddit?.uploaded?.length ? "#FF4500" : "#D1D5DB"}
            />

            <FaTelegram
              size={22}
              color={Post.telegram?.uploaded?.length ? "#26A5E4" : "#D1D5DB"}
            />

            <IoLogoDiscord
              size={22}
              color={Post.discord?.uploaded?.length ? "#5865F2" : "#D1D5DB"}
            />

            <img
              src={wykop}
              alt="Wykop"
              className={style.wykopIcon}
              style={{ opacity: Post.wykop?.uploaded?.length ? 1 : 0.25 }}
            />
          </div>
        </div>
      </div>

      {/* PRZYCISKI SEKCJI ROZWIJANYCH */}
      <div className={style.accordionBar}>
        <button
          className={`${style.accordionToggle} ${openShares ? style.active : ""}`}
          onClick={() => setOpenShares(!openShares)}
        >
          <div className={style.accordionLabel}>
            <FaShareAlt size={14} />
            <span>Gdzie udostępniono ({allShares.length})</span>
          </div>
          {openShares ? (
            <IoIosArrowUp size={18} />
          ) : (
            <IoIosArrowDown size={18} />
          )}
        </button>

        <button
          className={`${style.accordionToggle} ${openPreview ? style.active : ""}`}
          onClick={() => setOpenPreview(!openPreview)}
        >
          <div className={style.accordionLabel}>
            <FaEye size={14} />
            <span>Podgląd i treści (Preview)</span>
          </div>
          {openPreview ? (
            <IoIosArrowUp size={18} />
          ) : (
            <IoIosArrowDown size={18} />
          )}
        </button>
      </div>

      {/* ROZWIJANA SEKCJA 1: UDOSTĘPNIENIA */}
      {openShares && (
        <div className={style.sharesPanel}>
          {allShares.length === 0 ? (
            <p className={style.emptyText}>
              Ten post nie został jeszcze udostępniony na żadnej platformie.
            </p>
          ) : (
            <div className={style.sharesGrid}>
              {allShares.map((share) => (
                <div key={share.id} className={style.shareCard}>
                  <div className={style.shareHeader}>
                    {share.icon}
                    <span className={style.platformName}>
                      {share.platformLabel}
                    </span>
                  </div>
                  <div className={style.shareBody}>
                    <span className={style.accountName}>
                      {share.accountName}
                    </span>
                    <span className={style.shareDate}>
                      {formatDateCompact(share.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ROZWIJANA SEKCJA 2: PREVIEW */}
      {openPreview && (
        <div className={style.previewPanel}>
          <ResultsView data={Post} />
        </div>
      )}
    </div>
  );
}
