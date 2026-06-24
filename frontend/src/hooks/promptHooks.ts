import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "../services/api";
import { type Prompt } from "../types/promptTypes";

const PROMPTS_KEY = ["promptsConfig"];

export const useGetPrompts = () => {
  return useQuery<Prompt>({
    queryKey: PROMPTS_KEY,
    queryFn: async () => {
      const response = await api.get("/prompt/get-prompt");
      return response.data.prompts;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useEditPrompts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedPrompts: Prompt) => {
      const response = await api.put("/prompt/edit-prompt", updatedPrompts);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMPTS_KEY });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Nie udało się zapisać zmian");
    },
  });
};
