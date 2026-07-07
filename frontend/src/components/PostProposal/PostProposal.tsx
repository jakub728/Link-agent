import style from "./PostProposal.module.css";
import {
  FaFacebook,
  FaLinkedin,
  FaTwitterSquare,
  FaRedditSquare,
  FaTelegram,
} from "react-icons/fa";
import { IoLogoDiscord } from "react-icons/io5";
import { type PlatformType } from "../../types/generatedTypes";
import React from "react";
import Wykop from "../../assets/wykop.png";
import { useGetAllAccounts } from "../../hooks/accountHooks";

interface SocialContent {
  title?: string;
  content: string;
  subreddit?: string;
  additional_photos?: string;
  uploaded: boolean;
}

interface SocialPreviewProps {
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
  platform,
  contentData,
  globalLink,
  globalImage,
}: SocialPreviewProps) {
  const config = PLATFORM_CONFIG[platform];

  if (!contentData) return null;

  const IconComponent = config.icon;

  return (
    <div className={style.card}>
      <div className={style.header} style={{ borderLeftColor: config.color }}>
        <IconComponent size={30} color={config.color} />
        <span className={style.label} style={{ color: config.color }}>
          {config.label}
        </span>
      </div>

      <div className={style.body}>
        {config.hasTitle && contentData.title && (
          <h4 className={style.postTitle}>{contentData.title}</h4>
        )}

        <p className={style.postContent}>{contentData.content}</p>

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
    </div>
  );
}
