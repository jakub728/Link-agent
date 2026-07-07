import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { type AllAccountsInterface } from "../types/accountTypes";
import api from "../services/api";

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
    mutationFn: async (platform: string) => {
      const response = await api.get<{ url: string }>(
        `/connect/account/auth-url?platform=${platform}`,
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data && data.url) {
        window.open(data.url, "_blank");
      } else {
        console.error("Backend nie zwrócił URL-a", data);
      }
    },
    onError: (err) => {
      console.error("Błąd podczas pobierania linku autoryzacji:", err);
    },
  });
};

// 3. HOOK: Usuwanie danego social konta    !!!TRZEBA DODAC NA BACKENDZIE!!
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
