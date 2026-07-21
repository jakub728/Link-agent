import style from "./History.module.css";
import { useGetHistory } from "../../hooks/generateHooks";

import HistoryPost from "../../components/HistoryPost/HistoryPost";

export default function History() {
  const { data: history, isLoading, isError, error } = useGetHistory();
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
  const sortedHistory = [...history].sort((a, b) => {
    const dataA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dataB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dataB - dataA;
  });

  return (
    <div className={style.container}>
      <h2>Historia generowań</h2>
      <div>
        {sortedHistory.map((post) => (
          <HistoryPost key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}
