import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { type UserData } from "../types/userTypes";
import api from "../services/api";

export const useUserData = () => {
  const { data: userData } = useQuery<UserData>({
    queryKey: ["authUser"],
  });

  return {
    user: userData,
    prompts: userData?.prompts,
    role: userData?.role,
    isLoggedIn: !!userData,
  };
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/user/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["authUser"], null);
      navigate("/login");
    },
    onError: (error) => {
      console.error("Błąd wylogowania na froncie:", error);
      queryClient.setQueryData(["authUser"], null);
      navigate("/login");
    },
  });

  return {
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};
