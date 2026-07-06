import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

//https://ai.sulisz.pl/user/admin-create-user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

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
