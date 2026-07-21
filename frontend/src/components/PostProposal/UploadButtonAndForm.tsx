import { useState } from "react";
import style from "./PostProposal.module.css";
import { type UploadedAccount } from "../../types/generatedTypes";
import { useGetAllAccounts } from "../../hooks/accountHooks";
import { useUploadContent } from "../../hooks/uploadHooks";
import { useGetHistory } from "../../hooks/generateHooks";
import {
  IoCheckmarkCircle,
  IoRadioButtonOffOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";

interface UploadButtonAndFormProps {
  platform: string;
  postId: string;
}

export default function UploadButtonAndForm({
  platform,
  postId,
}: UploadButtonAndFormProps) {
  const navigate = useNavigate();
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  const { data: allAccountsData } = useGetAllAccounts();
  const { data: historyData } = useGetHistory();
  const { mutate: uploadContent, isPending: isUploadingContent } =
    useUploadContent();

  // Pobieramy konta dla danej platformy
  const platformAccounts =
    allAccountsData?.groupedAccounts?.[
      platform as keyof typeof allAccountsData.groupedAccounts
    ] || [];

  // Znajdujemy konkretny post w historii
  const specificPost = historyData?.find(
    (post) => post._id?.toString() === postId,
  );

  // Bezpieczny odczyt danych o wcześniejszych publikacjach na tej platformie
  const specificPlatformData: UploadedAccount[] =
    specificPost && platform in specificPost
      ? (
          specificPost[platform as keyof typeof specificPost] as {
            uploaded?: UploadedAccount[];
          }
        )?.uploaded || []
      : [];

  const toggleAccount = (accountId: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId],
    );
  };

  const handleSend = () => {
    if (selectedAccountIds.length === 0) return;

    uploadContent(
      {
        platform,
        generatedDataId: postId,
        accountIds: selectedAccountIds,
      },
      {
        onSuccess: () => {
          setSelectedAccountIds([]);
        },
      },
    );
  };

  if (platformAccounts.length === 0) {
    return (
      <div className={style.emptyAccountsState}>
        <p>Brak podpiętych kont dla tej platformy.</p>
        <button
          className={style.addAccountBtn}
          onClick={() => navigate("/accounts")}
        >
          + Dodaj konto
        </button>
      </div>
    );
  }

  return (
    <div className={style.uploadContainer}>
      <p className={style.sectionTitle}>Wybierz konta do publikacji:</p>

      <div className={style.accountsList}>
        {platformAccounts.map((account) => {
          const publishedData = specificPlatformData.find(
            (item) => item.accountName === account.profileName,
          );

          const isPublished = Boolean(publishedData);
          const isSelected = selectedAccountIds.includes(account._id);

          return (
            <div
              key={account._id}
              className={`${style.accountCard} ${isPublished ? style.published : ""} ${
                isSelected ? style.selected : ""
              }`}
              onClick={() => !isPublished && toggleAccount(account._id)}
            >
              <div className={style.statusIcon}>
                {isPublished ? (
                  <IoCheckmarkCircle
                    size={24}
                    className={style.iconPublished}
                    title="Już opublikowano"
                  />
                ) : isSelected ? (
                  <IoCheckmarkCircleOutline
                    size={24}
                    className={style.iconSelected}
                    title="Zaznaczone"
                  />
                ) : (
                  <IoRadioButtonOffOutline
                    size={24}
                    className={style.iconUnselected}
                    title="Kliknij, aby zaznaczyć"
                  />
                )}
              </div>

              <div className={style.accountInfo}>
                <h4 className={style.accountName}>{account.profileName}</h4>
                {isPublished && (
                  <span className={style.publishedBadge}>
                    Opublikowano:{" "}
                    {new Date(publishedData!.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        className={style.sendButton}
        disabled={selectedAccountIds.length === 0 || isUploadingContent}
        onClick={handleSend}
      >
        {isUploadingContent
          ? "Wysyłanie..."
          : `Wyślij na zaznaczone (${selectedAccountIds.length})`}
      </button>
    </div>
  );
}
