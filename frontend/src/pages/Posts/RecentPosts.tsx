import style from "./RecentPosts.module.css";
import { useState } from "react";
import { useGetAllAccounts, useGetRecentPosts } from "../../hooks/accountHooks";

export default function RecentPosts() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedAccountName, setSelectedAccountName] = useState<string>("");
  const [selectedAccountPicture, setSelectedAccountPicture] =
    useState<string>("");

  const {
    data: allAccounts,
    isPending: isAllAccountsLoading,
    error: allAccountsError,
  } = useGetAllAccounts();

  const {
    data: recentPosts,
    isPending: isPostsLoading,
    error: postsError,
  } = useGetRecentPosts(selectedAccountId);

  // Obsługa zmiany w selectcie
  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountId = e.target.value;
    setSelectedAccountId(accountId);

    // Przeszukujemy groupedAccounts, żeby wyciągnąć nazwę, ID i zdjęcie profilu
    if (allAccounts?.groupedAccounts) {
      for (const accountsList of Object.values(allAccounts.groupedAccounts)) {
        const found = accountsList.find((acc) => acc._id === accountId);
        if (found) {
          setSelectedAccountName(found.profileName || "Konto");
          setSelectedAccountPicture(found.picture || "");
          break;
        }
      }
    }
  };

  return (
    <div className={style.recentPosts}>
      <h2>Ostatnie posty</h2>

      {/* SEKCJA WYBORU KONTA */}
      <div className={style.selectContainer}>
        <label>Wybierz konto:</label>
        {isAllAccountsLoading ? (
          <p>Ładowanie kont...</p>
        ) : allAccountsError ? (
          <p>Błąd ładowania kont</p>
        ) : (
          <select value={selectedAccountId} onChange={handleAccountChange}>
            <option value="" disabled>
              -- Wybierz platformę i konto --
            </option>
            {allAccounts?.groupedAccounts &&
              Object.entries(allAccounts.groupedAccounts).map(
                ([platform, accounts]) => {
                  if (!accounts || accounts.length === 0) return null;
                  return (
                    <optgroup key={platform} label={platform.toUpperCase()}>
                      {accounts.map((account) => (
                        <option key={account._id} value={account._id}>
                          {account.profileName || account.profileId}
                        </option>
                      ))}
                    </optgroup>
                  );
                },
              )}
          </select>
        )}
      </div>

      {/* SEKCJA TREŚCI */}
      {!selectedAccountId && (
        <p className={style.infoText}>
          Wybierz konto z listy powyżej, aby zobaczyć jego posty.
        </p>
      )}

      {selectedAccountId && isPostsLoading && (
        <p>Pobieranie postów dla konta: {selectedAccountName}...</p>
      )}

      {selectedAccountId && postsError && <p>Błąd: {postsError.message}</p>}

      {selectedAccountId && recentPosts && (
        <div className={style.postsList}>
          <h3>Posty dla: {selectedAccountName}</h3>
          {recentPosts.posts?.length === 0 ? (
            <p>Brak postów na tym koncie.</p>
          ) : (
            recentPosts.posts?.map((post: any) => (
              <div key={post.id} className={style.postItem}>
                {/* Nagłówek posta z prawdziwym zdjęciem profilu */}
                <div className={style.postHeader}>
                  {selectedAccountPicture ? (
                    <img
                      src={selectedAccountPicture}
                      alt={selectedAccountName}
                      className={style.postAvatarImg}
                    />
                  ) : (
                    <div className={style.postAvatar}>
                      {selectedAccountName
                        ? selectedAccountName.charAt(0).toUpperCase()
                        : "P"}
                    </div>
                  )}

                  <div className={style.postMeta}>
                    <span className={style.postAuthorName}>
                      {selectedAccountName}
                    </span>
                    <span className={style.postDate}>
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Treść */}
                <p className={style.postContent}>{post.content}</p>

                {/* Obrazek w poście (jeśli istnieje) */}
                {post.imageUrl && (
                  <div className={style.imageContainer}>
                    <img
                      src={post.imageUrl}
                      alt="Grafika z posta"
                      className={style.postImage}
                    />
                  </div>
                )}

                {/* Stopka z linkiem */}
                {post.url && (
                  <div className={style.postFooter}>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={style.postLink}
                    >
                      Zobacz w serwisie ↗
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
