import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  type GeneratedPost,
  type ScrapedLinkData,
  type UpdatePostPayload,
} from "../types/generatedTypes";
import api from "../services/api";

// 1. HOOK: Pobieranie historii (Zmieniony na GET i poprawione response.data)
export const useGetHistory = () => {
  return useQuery<GeneratedPost[]>({
    queryKey: ["History"],
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
    onError: (_error: any) => {
      // alert(
      //   error.response?.data?.message || "Nie udało się pobrać danych z linku",
      // );
    },
  });
};

// 3. HOOK: Generator (Tworzenie postów przez LLM)
export const useGenerateContent = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GeneratedPost,
    Partial<ScrapedLinkData> & { overwrite?: boolean; model: string }
  >({
    mutationFn: async (postData) => {
      const response = await api.post("/generate/content", postData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["History"] });
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message || "Błąd podczas generowania treści AI",
      );
    },
  });
};

export const useEditContent = () => {
  const queryClient = useQueryClient();

  return useMutation<string, any, UpdatePostPayload>({
    mutationFn: async ({ generationId, title, content, platform }) => {
      const response = await api.patch(`/generate/edit/${generationId}`, {
        title,
        content,
        platform,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["History"] });
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message || "Błąd podczas edytowania treści AI",
      );
    },
  });
};
