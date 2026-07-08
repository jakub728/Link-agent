import style from "./Profiles.module.css";
import {
  useGetAllAccounts,
  useConnectPlatform,
} from "../../hooks/accountHooks";
import {
  FaLinkedin,
  FaReddit,
  FaFacebook,
  FaDiscord,
  FaTelegram,
} from "react-icons/fa";
import wykop from "../../assets/Wykop.png";


export default function Profiles() {
  const { data, isLoading } = useGetAllAccounts();
  const { mutate: connectPlatform, isPending } = useConnectPlatform();

  if (isLoading) return <div>Ładowanie...</div>;

  if (!data) {
    return <div>Brak danych</div>;
  }

  const platformIcons: Record<string, React.ReactNode> = {
    linkedin: <FaLinkedin size={32} color="#0A66C2" />,
    reddit: <FaReddit size={32} color="#FF4500" />,
    facebook: <FaFacebook size={32} color="#1877F2" />,
    wykop: (
      <img
        src={wykop}
        style={{ width: "32px", height: "32px", objectFit: "contain" }}
      />
    ),
    discord: <FaDiscord size={32} color="#5865F2" />,
    telegram: <FaTelegram size={32} color="#26A5E4" />,
  };

  const renderPlatformSection = (
    title: string,
    platformKey: keyof typeof data.groupedAccounts,
    platformName: string,
  ) => {
    const accounts = data.groupedAccounts[platformKey];

    return (
      <div className={style.container}>
        <h2>
          {platformIcons[platformKey]}
          {title}
        </h2>
        <button
          className={style.addButton}
          disabled={isPending}
          onClick={() => connectPlatform(platformName)}
        >
          {isPending ? "Ładowanie..." : "Dodaj konto"}
        </button>
        {accounts.length !== 0 ? (
          accounts.map((account, index) => (
            <div key={index} className={style.profile}>
              {account.picture ? (
                <img src={account.picture} />
              ) : (
                platformIcons[account.platform.toLowerCase()]
              )}

              <h2 key={account.profileId}>{account.profileName}</h2>
              <button>Usuń konto</button>
            </div>
          ))
        ) : (
          <>
            <p>Brak kont</p>
          </>
        )}
        <hr />
      </div>
    );
  };

  return (
    <div>
      <hr />
      {renderPlatformSection("Facebook", "facebook", "facebook")}
      {renderPlatformSection("Linkedin", "linkedin", "linkedin")}
      {renderPlatformSection("Reddit", "reddit", "reddit")}
      {renderPlatformSection("Wykop", "wykop", "wykop")}
      {renderPlatformSection("Discord", "discord", "discord")}
      {renderPlatformSection("Telegram", "telegram", "telegram")}
    </div>
  );
}
