import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { type AllAccountsInterface } from "../types/accountTypes";
import api from "../services/api";

interface ConnectPlatformPayload {
  platform: string;
  webhook?: string;
  botId?: string;
  chatId?: string;
}

const ACCOUNT_KEY = ["accounts"];

// 1. HOOK: Wszystkie dodane social konta
export const useGetAllAccounts = () => {
  return useQuery<AllAccountsInterface>({
    queryKey: ACCOUNT_KEY,
    queryFn: async () => {
      const response = await api.get<AllAccountsInterface>(
        "/connect/account/all",
      );
      return response.data;
    },
    placeholderData: {
      groupedAccounts: {
        facebook: [],
        linkedin: [],
        reddit: [],
        wykop: [],
        discord: [],
        telegram: [],
      },
    },
  });
};

// 2. HOOK: Dodawanie nowego konta
export const useConnectPlatform = () => {
  return useMutation({
    mutationFn: async ({
      platform,
      webhook,
      botId,
      chatId,
    }: ConnectPlatformPayload) => {
      if (platform === "telegram") {
        const response = await api.post<{ success: boolean; message?: string }>(
          `/connect/account/manual`,
          { platform, botId, chatId },
        );
        return { ...response.data, isManual: true };
      } else if (platform === "discord") {
        const response = await api.post<{ success: boolean; message?: string }>(
          `/connect/account/manual`,
          { platform, webhook }, // 👈 Dane lecą do backendu
        );
        return { ...response.data, isManual: true };
      } else {
        const response = await api.get<{ url: string }>(
          `/connect/account/auth-url?platform=${platform}`,
        );
        return { ...response.data, isManual: false };
      }
    },
    onSuccess: (data) => {
      if (data.isManual) {
        console.log("Konto manualne zostało pomyślnie dodane.");
        // Tutaj możesz dodać np. queryClient.invalidateQueries({ queryKey: ACCOUNT_KEY });
        return;
      }

      // Dla OAuth (FB/LinkedIn) otwieramy okno logowania
      if (data && "url" in data && data.url) {
        window.open(data.url, "_blank");
      } else {
        console.error("Backend nie zwrócił URL-a dla OAuth", data);
      }
    },

    onError: (err) => {
      console.error("Błąd podczas pobierania linku autoryzacji:", err);
    },
  });
};

// 3. HOOK: Usuwanie danego social konta
//DELETE /connect/account/delete/:id
export const useDisconnectAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      const response = await api.delete(`/connect/account/delete/${accountId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEY });
    },
    onError: (error) => {
      console.error("Błąd podczas odłączania konta:", error);
    },
  });
};
