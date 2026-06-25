import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  type GeneratedPost,
  type ScrapedLinkData,
} from "../types/generatedTypes";
import api from "../services/api";

const HISTORY_KEY = ["generationHistory"];

// 1. HOOK: Pobieranie historii (Zmieniony na GET i poprawione response.data)
export const useGetHistory = () => {
  return useQuery<GeneratedPost[]>({
    queryKey: HISTORY_KEY,
    queryFn: async () => {
      const response = await api.get("/generate/history");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

// 2. HOOK: Scraper (Wyciąganie danych z linku za pomocą Chromium)
export const useScrapeLink = () => {
  return useMutation<ScrapedLinkData, any, string>({
    mutationFn: async (url: string) => {
      const response = await api.post("/generate/data-from", { url });
      return response.data;
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message || "Nie udało się pobrać danych z linku",
      );
    },
  });
};

// 3. HOOK: Generator (Tworzenie postów przez LLM)
export const useGenerateContent = () => {
  const queryClient = useQueryClient();

  return useMutation<GeneratedPost, any, Partial<ScrapedLinkData> & { overwrite?: boolean }>({
    mutationFn: async (postData) => {
      const response = await api.post("/generate/content", postData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY });
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message || "Błąd podczas generowania treści AI",
      );
    },
  });
};
