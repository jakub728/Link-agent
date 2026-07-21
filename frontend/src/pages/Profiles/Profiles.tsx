import style from "./Profiles.module.css";
import {
  useGetAllAccounts,
  useConnectPlatform,
  useDisconnectAccount,
} from "../../hooks/accountHooks";
import {
  FaLinkedin,
  FaReddit,
  FaFacebook,
  FaDiscord,
  FaTelegram,
} from "react-icons/fa";
import wykop from "../../assets/Wykop.png";
import { useState } from "react";

export default function Profiles() {
  const { data, isLoading } = useGetAllAccounts();
  const { mutate: connectPlatform, isPending: connectPending } =
    useConnectPlatform();
  const { mutate: disconnectPlatform, isPending: disconnectPending } =
    useDisconnectAccount();

  const [discordWebhookState, setDiscordWebhookState] = useState<string>("");
  const [telegramBotIdState, setTelegramBotIdState] = useState<string>("");
  const [telegramChatIdState, setTelegramChatIdState] = useState<string>("");

  if (isLoading) return <div>Ładowanie...</div>;
  if (!data) return <div>Brak danych</div>;

  const platformIcons: Record<string, React.ReactNode> = {
    linkedin: <FaLinkedin size={32} color="#0A66C2" />,
    reddit: <FaReddit size={32} color="#FF4500" />,
    facebook: <FaFacebook size={32} color="#1877F2" />,
    wykop: (
      <img
        src={wykop}
        style={{ width: "32px", height: "32px", objectFit: "contain" }}
        alt="Wykop"
      />
    ),
    discord: <FaDiscord size={32} color="#5865F2" />,
    telegram: <FaTelegram size={32} color="#26A5E4" />,
  };

  const handleConnect = (platformName: string) => {
    connectPlatform(
      {
        platform: platformName,
        webhook: platformName === "discord" ? discordWebhookState : undefined,
        botId: platformName === "telegram" ? telegramBotIdState : undefined,
        chatId: platformName === "telegram" ? telegramChatIdState : undefined,
      },
      {
        onSuccess: () => {
          if (platformName === "discord") setDiscordWebhookState("");
          if (platformName === "telegram") {
            setTelegramBotIdState("");
            setTelegramChatIdState("");
          }
        },
      },
    );
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

        {platformName === "discord" && (
          <div className={style.manualForm}>
            <input
              type="text"
              placeholder="Webhook URL"
              value={discordWebhookState}
              onChange={(e) => setDiscordWebhookState(e.target.value)}
              className={style.inputField}
            />
          </div>
        )}

        {platformName === "telegram" && (
          <div className={style.manualForm}>
            <input
              type="text"
              placeholder="Bot Token"
              value={telegramBotIdState}
              onChange={(e) => setTelegramBotIdState(e.target.value)}
              className={style.inputField}
            />
            <input
              type="text"
              placeholder="Chat ID"
              value={telegramChatIdState}
              onChange={(e) => setTelegramChatIdState(e.target.value)}
              className={style.inputField}
            />
          </div>
        )}

        <button
          className={style.addButton}
          disabled={connectPending}
          onClick={() => handleConnect(platformName)}
        >
          {connectPending ? "Ładowanie..." : "Dodaj konto"}
        </button>

        {accounts.length !== 0 ? (
          accounts.map((account) => (
            <div key={account._id} className={style.profile}>
              {account.picture ? (
                <img src={account.picture} alt={account.profileName} />
              ) : (
                platformIcons[account.platform.toLowerCase()]
              )}

              <h2>{account.profileName}</h2>
              <button
                disabled={disconnectPending}
                onClick={() => disconnectPlatform(account._id)}
              >
                {disconnectPending ? "Ładowanie..." : "Odłącz konto"}
              </button>
            </div>
          ))
        ) : (
          <div className={style.profile}>Brak kont</div>
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
