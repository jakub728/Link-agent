import { useState, useEffect } from "react";
import style from "./Generate.module.css";
import { type Prompt } from "../../types/promptTypes";

import { useScrapeLink, useGenerateContent } from "../../hooks/generateHooks";
import { useGetPrompts, useEditPrompts } from "../../hooks/promptHooks";
import ResultsView from "../../components/PostProposal/ResultProposal";

// IKONY
import Groq from "../../assets/groq-icon.svg";
import Wykop from "../../assets/Wykop.png";
import {
  FaFacebook,
  FaLinkedin,
  FaRedditSquare,
  FaTelegram,
  FaDiscord,
} from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function Generate() {
  const [urlInput, setUrlInput] = useState("");
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const [promptState, setPromptState] = useState<Prompt | null>(null);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showAlert, setShowAlert] = useState("");

  const scrapeMutation = useScrapeLink();
  const {
    data: generatedData,
    mutate: generateContent,
    isPending: isGenerating,
  } = useGenerateContent();
  const { data: promptConfig, isLoading: isLoadingPrompt } = useGetPrompts();
  const editPromptMutation = useEditPrompts();

  useEffect(() => {
    if (promptConfig) {
      setPromptState(promptConfig);
    }
  }, [promptConfig]);

  // POBIERANIEDANYCH Z LINKU
  const handleScrape = () => {
    scrapeMutation.mutate(urlInput, {
      onError: () => {
        setShowAlert(
          "Niepoprawny link lub błąd podczas pobierania danych z linku",
        );
        setTimeout(() => setShowAlert(""), 5000);
      },
      onSuccess: (data) => {
        setScrapedData(data);
        setShowAlert(`Pobrano dane z linku: ${data.title}`);
        setTimeout(() => setShowAlert(""), 5000);
      },
    });
  };

  // GENROWANIE TREŚCI
  const handleGenerate = (shouldOverwrite: boolean) => {
    if (!scrapedData) return;

    generateContent(
      { ...scrapedData, overwrite: shouldOverwrite },
      {
        onSuccess: (newPost) => {
          setShowAlert(`Wygenerowano treści dla: ${newPost.title}`);
          setTimeout(() => setShowAlert(""), 5000);
        },
      },
    );
  };

  const handleUpdatePrompt = () => {
    if (!promptState) return;

    editPromptMutation.mutate(promptState, {
      onSuccess: () => {
        setShowAlert(`Konfiguracja promptów została zaktualizowana!`);
        setTimeout(() => setShowAlert(""), 5000);
      },
    });
  };

  return (
    <div className={style.container}>
      <h3 style={{ color: "green" }}>{showAlert}</h3>
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
            ? "Pobieranie danych..."
            : "Pobierz dane z linku"}
        </button>
      </div>

      {/* Sekcja podglądu i generowania treści */}
      {scrapedData && (
        <div className={style.previewCard}>
          <h3>{scrapedData.title}</h3>
          <p>{scrapedData.description}</p>
          <img src={scrapedData.imageUrl} alt="image" />
        </div>
      )}

      <hr className={style.divider} />

      {/* Przycisk generowania LLM */}
      <div className={style.promptToggleSection}>
        {scrapedData && !generatedData && (
          <button
            onClick={() => handleGenerate(false)}
            disabled={isGenerating}
            className={style.generateButton}
          >
            {isGenerating ? "Generowanie..." : "🚀 Generuj posty na sociale!"}
          </button>
        )}
        {scrapedData && generatedData && (
          <button
            onClick={() => handleGenerate(true)} // overwrite: true
            disabled={isGenerating}
            className={style.generateButton}
          >
            {isGenerating ? "Generowanie..." : "🔄 Wygeneruj ponownie"}
          </button>
        )}
        {scrapedData && (
          <button
            type="button"
            onClick={() => setShowPrompt(!showPrompt)}
            className={style.secondaryButton}
          >
            {showPrompt ? "❌ Ukryj prompty" : "⚙️ Dostosuj prompty AI"}
          </button>
        )}
      </div>

      {/* Dynamiczny panel edycji promptu */}
      {showPrompt && (
        <div className={style.promptPanel}>
          <div className={style.promptHeader}>
            <h3>Główny Prompt Systemowy Groq </h3>
            <img
              src={Groq}
              alt="Groq"
              className={style.groqIcon}
              style={{
                width: "25px",
                height: "25px",
                backgroundColor: "#F05A28",
                borderRadius: "50%",
                padding: "5px",
                marginRight: "10px",
              }}
            />
          </div>
          <button
            onClick={handleUpdatePrompt}
            disabled={editPromptMutation.isPending}
            className={style.saveButton}
          >
            {editPromptMutation.isPending ? "Zapisywanie..." : "Zapisz"}
          </button>
          {isLoadingPrompt || !promptState ? (
            <p>Ładowanie konfiguracji z bazy...</p>
          ) : (
            <>
              <textarea
                value={promptState.systemPrompt}
                onChange={(e) =>
                  setPromptState((prev) =>
                    prev ? { ...prev, systemPrompt: e.target.value } : null,
                  )
                }
                rows={6}
                className={style.textarea}
                placeholder="Tutaj wpisz instrukcje dla AI..."
              />
            </>
          )}
          <h3>Kategorie</h3>
          {isLoadingPrompt || !promptState ? (
            <p>Ładowanie konfiguracji z bazy...</p>
          ) : (
            <>
              {promptState.allowedCategories.map((cat, index) => (
                <div
                  className={style.categories}
                  key={index}
                  onClick={() => {
                    setPromptState((prev) =>
                      prev
                        ? {
                            ...prev,
                            allowedCategories: prev.allowedCategories.filter(
                              (c) => c !== cat,
                            ),
                          }
                        : null,
                    );
                  }}
                >
                  {cat} <span className={style.x}>x</span>
                </div>
              ))}
            </>
          )}
          <div className={style.inputCategory}>
            <input
              type="text"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              placeholder="Dodaj nową kategorię..."
              className={style.categoryInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!newCategoryInput.trim()) return;

                  setPromptState((prev) =>
                    prev
                      ? {
                          ...prev,
                          allowedCategories: [
                            ...prev.allowedCategories,
                            newCategoryInput.trim(),
                          ],
                        }
                      : null,
                  );
                  setNewCategoryInput("");
                }
              }}
            />
            <button
              type="button"
              className={style.categoryButton}
              onClick={() => {
                if (!newCategoryInput.trim()) return;
                setPromptState((prev) =>
                  prev
                    ? {
                        ...prev,
                        allowedCategories: [
                          ...prev.allowedCategories,
                          newCategoryInput.trim(),
                        ],
                      }
                    : null,
                );
                setNewCategoryInput("");
              }}
            >
              Dodaj
            </button>
          </div>
          <div className={style.promptSubsection}>
            <div>
              <div className={style.promptHeader}>
                <h3>Prompt</h3>
                <FaFacebook
                  style={{
                    width: "30px",
                    height: "30px",
                    color: "#1877F2",
                  }}
                />
              </div>

              {isLoadingPrompt || !promptState ? (
                <p>Ładowanie konfiguracji z bazy...</p>
              ) : (
                <>
                  <textarea
                    value={promptState.facebook.titleDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              facebook: {
                                ...prev.facebook,
                                titleDescription: e.target.value, // Poprawny deep-spread i usunięta literówka
                              },
                            }
                          : null,
                      )
                    }
                    rows={2}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                  <textarea
                    value={promptState.facebook.contentDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              facebook: {
                                ...prev.facebook,
                                contentDescription: e.target.value, // Poprawny deep-spread i usunięta literówka
                              },
                            }
                          : null,
                      )
                    }
                    rows={4}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                </>
              )}
            </div>
            <div>
              <div className={style.promptHeader}>
                <h3>Prompt</h3>
                <FaLinkedin
                  style={{
                    width: "30px",
                    height: "30px",
                    color: "#0A66C2",
                  }}
                />
              </div>
              {isLoadingPrompt || !promptState ? (
                <p>Ładowanie konfiguracji z bazy...</p>
              ) : (
                <>
                  <textarea
                    value={promptState.linkedin.titleDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              linkedin: {
                                ...prev.linkedin,
                                titleDescription: e.target.value, // Poprawny deep-spread i usunięta literówka
                              },
                            }
                          : null,
                      )
                    }
                    rows={2}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                  <textarea
                    value={promptState.linkedin.contentDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              linkedin: {
                                ...prev.linkedin,
                                contentDescription: e.target.value, // Poprawny deep-spread i usunięta literówka
                              },
                            }
                          : null,
                      )
                    }
                    rows={4}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                </>
              )}
            </div>
            <div>
              <div className={style.promptHeader}>
                <h3>Prompt</h3>
                <FaSquareXTwitter className={style.iconX} />
              </div>
              {isLoadingPrompt || !promptState ? (
                <p>Ładowanie konfiguracji z bazy...</p>
              ) : (
                <>
                  <textarea
                    value={promptState.x.titleDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              x: {
                                ...prev.x,
                                titleDescription: e.target.value, // Poprawny deep-spread i usunięta literówka
                              },
                            }
                          : null,
                      )
                    }
                    rows={2}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                  <textarea
                    value={promptState.x.contentDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              x: {
                                ...prev.x,
                                contentDescription: e.target.value, // Poprawny deep-spread i usunięta literówka
                              },
                            }
                          : null,
                      )
                    }
                    rows={4}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                </>
              )}
            </div>
            <div>
              <div className={style.promptHeader}>
                <h3>Prompt</h3>
                <img
                  src={Wykop}
                  alt="Wykop"
                  className={style.groqIcon}
                  style={{
                    height: "30px",
                    borderRadius: "50%",
                    padding: "5px",
                  }}
                />
              </div>
              {isLoadingPrompt || !promptState ? (
                <p>Ładowanie konfiguracji z bazy...</p>
              ) : (
                <>
                  <textarea
                    value={promptState.wykop.titleDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              wykop: {
                                ...prev.wykop,
                                titleDescription: e.target.value, // Poprawny deep-spread i usunięta literówka
                              },
                            }
                          : null,
                      )
                    }
                    rows={3}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                  <textarea
                    value={promptState.wykop.contentDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              wykop: {
                                ...prev.wykop,
                                contentDescription: e.target.value, // Poprawny deep-spread i usunięta literówka
                              },
                            }
                          : null,
                      )
                    }
                    rows={5}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                </>
              )}
            </div>
            <div>
              <div className={style.promptHeader}>
                <h3>Prompt</h3>
                <FaDiscord
                  style={{
                    width: "30px",
                    height: "30px",
                    color: "#5865F2",
                  }}
                />
              </div>
              {isLoadingPrompt || !promptState ? (
                <p>Ładowanie konfiguracji z bazy...</p>
              ) : (
                <>
                  <textarea
                    value={promptState.discord.titleDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              discord: {
                                ...prev.discord,
                                titleDescription: e.target.value, // Poprawny deep-spread i usunięta literówka
                              },
                            }
                          : null,
                      )
                    }
                    rows={3}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                  <textarea
                    value={promptState.discord.contentDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              discord: {
                                ...prev.discord,
                                contentDescription: e.target.value, // Poprawny deep-spread i usunięta literówka
                              },
                            }
                          : null,
                      )
                    }
                    rows={4}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                </>
              )}
            </div>
            <div>
              <div className={style.promptHeader}>
                <h3>Prompt</h3>
                <FaTelegram
                  style={{
                    width: "30px",
                    height: "30px",
                    color: "#0088cc",
                  }}
                />
              </div>
              {isLoadingPrompt || !promptState ? (
                <p>Ładowanie konfiguracji z bazy...</p>
              ) : (
                <>
                  <textarea
                    value={promptState.discord.titleDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              discord: {
                                ...prev.discord,
                                titleDescription: e.target.value, // Poprawny deep-spread i usunięta literówka
                              },
                            }
                          : null,
                      )
                    }
                    rows={3}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                  <textarea
                    value={promptState.discord.contentDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              discord: {
                                ...prev.discord,
                                contentDescription: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    rows={4}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                </>
              )}
            </div>
            <div>
              <div className={style.promptHeader}>
                <h3>Prompt</h3>
                <FaRedditSquare
                  style={{
                    width: "30px",
                    height: "30px",
                    color: "#FF4500",
                  }}
                />
              </div>
              {isLoadingPrompt || !promptState ? (
                <p>Ładowanie konfiguracji z bazy...</p>
              ) : (
                <>
                  <textarea
                    value={promptState.reddit.titleDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              reddit: {
                                ...prev.reddit,
                                titleDescription: e.target.value, // Poprawny deep-spread i usunięta literówka
                              },
                            }
                          : null,
                      )
                    }
                    rows={2}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                  <textarea
                    value={promptState.reddit.contentDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              reddit: {
                                ...prev.reddit,
                                contentDescription: e.target.value, // Poprawny deep-spread i usunięta literówka
                              },
                            }
                          : null,
                      )
                    }
                    rows={3}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                  <textarea
                    value={promptState.reddit.subredditDescription}
                    onChange={(e) =>
                      setPromptState((prev) =>
                        prev
                          ? {
                              ...prev,
                              reddit: {
                                ...prev.reddit,
                                subredditDescription: e.target.value, // Poprawny deep-spread i usunięta literówka
                              },
                            }
                          : null,
                      )
                    }
                    rows={6}
                    className={style.textarea}
                    placeholder="Tutaj wpisz instrukcje dla AI..."
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Podgląd postów */}
      {generatedData && <ResultsView data={generatedData} />}
    </div>
  );
}
