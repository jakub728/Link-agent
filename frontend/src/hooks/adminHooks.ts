import { useMutation } from "@tanstack/react-query";
import api from "../services/api";

// 1. HOOK: Tworzenie nowego użytkownika [Admin]
export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (userData: {
      login: string;
      password: string;
      role: string;
    }) => {
      const { data } = await api.post("/user/admin-create-user", userData);
      return data;
    },
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ["users"] });
    // },
    onError: (error: any) => {
      console.error("Błąd tworzenia:", error);
      alert(error.response?.data?.message || "Wystąpił błąd");
    },
  });
};
