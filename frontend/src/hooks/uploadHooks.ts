import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "../services/api";

// 1. HOOK: Przesyłanie wygenerowanej treści na platformy społecznościowe
export const useUploadContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      generatedDataId: string;
      platform: string;
      accountIds: string[];
    }) => {
      const response = await api.post("/upload/content", data);
      return response.data;
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message ||
          "Błąd podczas przesyłania treści na platformy społecznościowe",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["History"] });
    },
  });
};
