import style from "./PostProposal.module.css";
import { useState } from "react";
import {
  FaFacebook,
  FaLinkedin,
  FaTwitterSquare,
  FaRedditSquare,
  FaTelegram,
} from "react-icons/fa";
import { IoLogoDiscord } from "react-icons/io5";
import { type PlatformType } from "../../types/generatedTypes";
import Wykop from "../../assets/Wykop.png";
import UploadButtonAndForm from "./UploadButtonAndForm";
import { useEditContent } from "../../hooks/generateHooks";

interface UploadContent {
  accountId: string;
  accountName: string;
  createdAt: Date;
}

interface SocialContent {
  id?: string;
  title?: string;
  content: string;
  subreddit?: string;
  additional_photos?: string;
  uploaded: UploadContent[];
}

interface SocialPreviewProps {
  id: string;
  platform: PlatformType;
  contentData: SocialContent;
  globalLink?: string | null;
  globalImage?: string | null;
}

interface PlatformItemConfig {
  label: string;
  color: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  hasTitle: boolean;
}

const PLATFORM_CONFIG: Record<PlatformType, PlatformItemConfig> = {
  facebook: {
    label: "Facebook",
    color: "#1877F2",
    icon: FaFacebook,
    hasTitle: false,
  },
  x: {
    label: "X (Twitter)",
    color: "#000000",
    icon: FaTwitterSquare,
    hasTitle: false,
  },
  linkedin: {
    label: "LinkedIn",
    color: "#0A66C2",
    icon: FaLinkedin,
    hasTitle: true,
  },
  reddit: {
    label: "Reddit",
    color: "#FF4500",
    icon: FaRedditSquare,
    hasTitle: true,
  },
  wykop: {
    label: "Wykop",
    color: "#FF5812",
    icon: () => (
      <img src={Wykop} alt="Wykop" style={{ width: "30px", height: "24px" }} />
    ),
    hasTitle: true,
  },
  discord: {
    label: "Discord",
    color: "#5865F2",
    icon: IoLogoDiscord,
    hasTitle: false,
  },
  telegram: {
    label: "Telegram",
    color: "#26A5E4",
    icon: FaTelegram,
    hasTitle: false,
  },
};

export default function PostProposal({
  id,
  platform,
  contentData,
  globalLink,
  globalImage,
}: SocialPreviewProps) {
  if (!contentData) return null;
  const config = PLATFORM_CONFIG[platform];

  const IconComponent = config.icon;

  const [editPost, setEditPost] = useState(false);
  const [newTitle, setNewTitle] = useState(contentData.title || "");
  const [newContent, setNewContent] = useState(contentData.content || "");

  const { mutate: editContent, isPending } = useEditContent();

  const handleSave = () => {
    editContent(
      {
        generationId: id,
        platform,
        title: newTitle,
        content: newContent,
      },
      {
        onSuccess: () => {
          setEditPost(false);
        },
      },
    );
  };

  const handleCancel = () => {
    setNewTitle(contentData.title || "");
    setNewContent(contentData.content || "");
    setEditPost(false);
  };

  return (
    <div className={style.card}>
      <div className={style.header} style={{ borderLeftColor: config.color }}>
        <div className={style.headerSmall}>
          <IconComponent size={30} color={config.color} />
          <span className={style.label} style={{ color: config.color }}>
            {config.label}
          </span>
        </div>

        {editPost && (
          <div className={style.actions}>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className={style.cancelBtn}
            >
              Anuluj
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className={style.saveBtn}
            >
              {isPending ? "Zapisywanie..." : "Zapisz"}
            </button>
          </div>
        )}
      </div>

      <div className={style.body}>
        {/* EDYCJA LUB TYTUŁ */}
        {config.hasTitle &&
          (editPost ? (
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={style.titleInput}
              placeholder="Tytuł posta..."
            />
          ) : (
            contentData.title && (
              <h4
                className={style.postTitle}
                onClick={() => setEditPost(true)}
                title="Kliknij, aby edytować"
              >
                {newTitle} ✏️
              </h4>
            )
          ))}

        {/* EDYCJA LUB TREŚĆ */}
        {editPost ? (
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className={style.contentTextarea}
            rows={5}
            placeholder="Treść posta..."
          />
        ) : (
          <p
            className={style.postContent}
            onClick={() => setEditPost(true)}
            title="Kliknij, aby edytować"
          >
            {newContent}
          </p>
        )}

        {/* ZAŁĄCZNIKI */}
        {(globalLink || globalImage) && (
          <div className={style.attachmentPreview}>
            {globalImage && (
              <img
                src={`https://ai.sulisz.pl/public${globalImage}`}
                alt="Podgląd"
                className={style.previewImg}
              />
            )}
          </div>
        )}
      </div>

      <UploadButtonAndForm platform={platform} postId={id} />
    </div>
  );
}
