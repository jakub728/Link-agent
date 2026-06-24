import { useState, useEffect } from "react";
import { useScrapeLink, useGenerateContent } from "../../hooks/generateHooks";
import { useGetPrompts, useEditPrompts } from "../../hooks/promptHooks";
import style from "./Generate.module.css";

export default function Generate() {
  const [urlInput, setUrlInput] = useState("");
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Stan do edycji samego tekstu promptu systemowego
  const [systemPromptText, setSystemPromptText] = useState("");

  const scrapeMutation = useScrapeLink();
  const generateMutation = useGenerateContent();
  const { data: promptConfig, isLoading: isLoadingPrompt } = useGetPrompts();
  const editPromptMutation = useEditPrompts();

  // Kiedy dane promptu załadują się z bazy, synchronizujemy je z naszym lokalnym stanem textarea
  useEffect(() => {
    if (promptConfig?.systemPrompt) {
      setSystemPromptText(promptConfig.systemPrompt);
    }
  }, [promptConfig]);

  const handleScrape = () => {
    scrapeMutation.mutate(urlInput, {
      onSuccess: (data) => setScrapedData(data),
    });
  };

  const handleGenerate = () => {
    if (!scrapedData) return;
    generateMutation.mutate(scrapedData, {
      onSuccess: (newPost) => {
        alert(`Sukces! Wygenerowano treści dla: ${newPost.title}`);
      },
    });
  };

  const handleUpdatePrompt = () => {
    if (!promptConfig) return;

    // Wysyłamy zaktualizowany obiekt Prompt zachowując resztę pól (facebook, x, itp.)
    editPromptMutation.mutate(
      {
        ...promptConfig,
        systemPrompt: systemPromptText,
      },
      {
        onSuccess: () =>
          alert("Prompt systemowy został zaktualizowany bazowo!"),
      },
    );
  };

  return (
    <div className={style.container}>
      {/* Sekcja przycisku konfiguracji promptów */}
      <div className={style.promptToggleSection}>
        <button
          type="button"
          onClick={() => setShowPrompt(!showPrompt)}
          className={style.secondaryButton}
        >
          {showPrompt ? "❌ Ukryj ustawienia AI" : "⚙️ Dostosuj Prompt AI"}
        </button>
      </div>

      {/* Dynamiczny panel edycji promptu */}
      {showPrompt && (
        <div className={style.promptPanel}>
          <h3>Główny Prompt Systemowy (LLM)</h3>
          {isLoadingPrompt ? (
            <p>Ładowanie konfiguracji z bazy...</p>
          ) : (
            <>
              <textarea
                value={systemPromptText}
                onChange={(e) => setSystemPromptText(e.target.value)}
                rows={6}
                className={style.textarea}
                placeholder="Tutaj wpisz instrukcje dla AI..."
              />
              <button
                onClick={handleUpdatePrompt}
                disabled={editPromptMutation.isPending}
                className={style.saveButton}
              >
                {editPromptMutation.isPending
                  ? "Zapisywanie..."
                  : "Zapisz nowy prompt"}
              </button>
            </>
          )}
        </div>
      )}

      <hr className={style.divider} />

      {/* Sekcja główna Scrapera */}
      <div className={style.scraperSection}>
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Wklej link do artykułu"
          className={style.input}
        />
        <button
          onClick={handleScrape}
          disabled={scrapeMutation.isPending}
          className={style.primaryButton}
        >
          {scrapeMutation.isPending
            ? "Uruchamianie Chromium..."
            : "Pobierz dane z linku"}
        </button>
      </div>

      {/* Sekcja podglądu i generowania treści */}
      {scrapedData && (
        <div className={style.previewCard}>
          <h3>{scrapedData.title}</h3>
          <p>{scrapedData.description}</p>
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className={style.generateButton}
          >
            {generateMutation.isPending
              ? "Sztuczna Inteligencja myśli..."
              : "🚀 Generuj posty na sociale!"}
          </button>
        </div>
      )}
    </div>
  );
}
