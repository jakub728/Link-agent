import style from "./PostProposal.module.css";
import { useState } from "react";
import { type UploadedAccount } from "../../types/generatedTypes";
import { useGetAllAccounts } from "../../hooks/accountHooks";
import { useUploadContent } from "../../hooks/uploadHooks";
import { useGetHistory } from "../../hooks/generateHooks";
import { GoDot, GoDotFill } from "react-icons/go";

export default function UploadButtonAndForm({
  platform,
  postId,
}: {
  platform: string;
  postId: string;
}) {
  const { data: allAccountsData } = useGetAllAccounts();
  const { data: historyData, isLoading: isLoadingHistory } = useGetHistory();
  const { mutate: uploadContent, isPending: isUploadingContent } =
    useUploadContent();
  const [accountsIds, setAccountsIds] = useState<string[]>([]);

  const platformAccounts =
    allAccountsData?.groupedAccounts[
      platform as keyof typeof allAccountsData.groupedAccounts
    ] || [];

  const specificPost = historyData?.find(
    (post) => post._id?.toString() === postId,
  );
  let specificPlatformData = [];

  if (specificPost) {
    const platformKey = platform as keyof typeof specificPost;
    const platformData = specificPost[platformKey] as any;
    specificPlatformData = platformData?.uploaded || [];
  }

  const handleSend = () => {
    if (accountsIds.length === 0)
      return alert("Wybierz przynajmniej jedno konto!");

    uploadContent(
      {
        platform: platform,
        generatedDataId: postId,
        accountIds: accountsIds,
      },
      {
        onSuccess: () => {
          setAccountsIds([]);
        },
      },
    );
  };

  return (
    <div>
      {platformAccounts.length > 0 ? (
        <div>
          <p>Wyślij na:</p>
          {platformAccounts.map((account, index) => {
            const postData = specificPlatformData.find(
              (object: UploadedAccount) =>
                object.accountName === account.profileName,
            );

            return (
              <div className={style.accountCard} key={index}>
                {postData ? (
                  <p>
                    Opublikowano o{" "}
                    {new Date(postData.createdAt).toLocaleDateString()}
                  </p>
                ) : !accountsIds.includes(account._id) ? (
                  <GoDot
                    size={35}
                    color="black"
                    title="Nie opublikowano"
                    onClick={() => {
                      setAccountsIds([...accountsIds, account._id]);
                    }}
                  />
                ) : (
                  <GoDotFill
                    size={35}
                    color="black"
                    title="Do publikacji"
                    onClick={() => {
                      const allWithout = accountsIds.filter(
                        (id) => id !== account._id,
                      );
                      setAccountsIds(allWithout);
                    }}
                  />
                )}
                <h3>{account.profileName}</h3>
              </div>
            );
          })}
          <button
            className={style.sendButton}
            disabled={accountsIds.length === 0 || isUploadingContent}
            onClick={handleSend}
          >
            {isUploadingContent ? "Wysyłanie..." : "Wyślij"}
          </button>
        </div>
      ) : (
        <p>Dodaj konta</p>
      )}
    </div>
  );
}
