import React, { useState } from "react";

export type EpgProvider =
  | "eleven_sports"
  | "polsat_sport_1-3"
  | "polsat_premium_1-6";

interface ProviderOption {
  value: EpgProvider;
  label: string;
}

const PROVIDERS: ProviderOption[] = [
  { value: "eleven_sports", label: "Eleven Sports" },
  { value: "polsat_sport_1-3", label: "Polsat Sport 1-3 (Plik zbiorczy)" },
  {
    value: "polsat_premium_1-6",
    label: "Polsat Premium + Extra (Plik zbiorczy)",
  },
];

// Typ dopasowany do tego, co zwraca Twój backend
interface ParsedProgramme {
  channelId: string;
  start: string;
  stop: string;
  title: string;
  description?: string;
  category?: string[];
  live: boolean;
  isLocked: boolean;
}

interface PreviewResponse {
  success: boolean;
  count: number;
  provider: string;
  programmes: ParsedProgramme[];
}

export default function Parser() {
  const [provider, setProvider] = useState<EpgProvider>("eleven_sports");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<PreviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setError("Wybierz plik .xlsx!");
      return;
    }

    setLoading(true);
    setError(null);
    setParsedData(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("provider", provider);

    try {
      const response = await fetch(
        "https://epg.sulisz.pl/upload/preview-excel",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Błąd podczas parsowania pliku.");
      }

      setParsedData(data);
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "Wystąpił błąd.";
      setError(errorText);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString("pl-PL", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeOnly = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "20px auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#1e293b",
        }}
      >
        Test i Podgląd Parsowania EPG
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "24px",
          padding: "20px",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 600,
              color: "#334155",
            }}
          >
            Wybierz format / kanał:
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as EpgProvider)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              outline: "none",
            }}
          >
            {PROVIDERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 600,
              color: "#334155",
            }}
          >
            Plik Excel (.xlsx):
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#fff",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          style={{
            marginTop: "8px",
            padding: "12px",
            backgroundColor: loading || !file ? "#94a3b8" : "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: loading || !file ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
          }}
        >
          {loading ? "Parsowanie pliku..." : "Wygeneruj podgląd"}
        </button>
      </form>

      {error && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "6px",
            marginBottom: "16px",
            border: "1px solid #f87171",
          }}
        >
          {error}
        </div>
      )}

      {parsedData && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              borderBottom: "2px solid #e2e8f0",
              paddingBottom: "12px",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: "#0f172a",
                margin: 0,
              }}
            >
              Znalezione transmisje na żywo
            </h3>
            <span
              style={{
                backgroundColor: "#dbeafe",
                color: "#1d4ed8",
                padding: "4px 12px",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              Ilość: {parsedData.count}
            </span>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {parsedData.programmes.length === 0 ? (
              <p
                style={{
                  color: "#64748b",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                Brak pasujących wydarzeń w tym pliku (lub brak transmisji na
                żywo).
              </p>
            ) : (
              parsedData.programmes.map((prog, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Lewa kolumna z datą i kanałem */}
                  <div
                    style={{
                      backgroundColor: "#f1f5f9",
                      padding: "16px",
                      minWidth: "140px",
                      borderRight: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "#0f172a",
                        fontSize: "0.95rem",
                      }}
                    >
                      {formatDate(prog.start).split(" ")[0]}{" "}
                      {formatDate(prog.start).split(" ")[1]}
                    </div>
                    <div
                      style={{
                        color: "#475569",
                        fontSize: "0.85rem",
                        marginTop: "4px",
                      }}
                    >
                      {formatTimeOnly(prog.start)} - {formatTimeOnly(prog.stop)}
                    </div>
                    <div
                      style={{
                        marginTop: "8px",
                        display: "inline-block",
                        backgroundColor: "#ef4444",
                        color: "white",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        textAlign: "center",
                      }}
                    >
                      {prog.channelId}
                    </div>
                  </div>

                  {/* Prawa kolumna z treścią */}
                  <div style={{ padding: "16px", flex: 1 }}>
                    {prog.category && prog.category.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          marginBottom: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        {prog.category.map((cat, i) => (
                          <span
                            key={i}
                            style={{
                              backgroundColor: "#e0e7ff",
                              color: "#4338ca",
                              fontSize: "0.75rem",
                              padding: "2px 8px",
                              borderRadius: "999px",
                            }}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                    <h4
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        color: "#1e293b",
                      }}
                    >
                      {prog.title}
                    </h4>
                    {prog.description && prog.description !== prog.title && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          color: "#64748b",
                        }}
                      >
                        {prog.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
