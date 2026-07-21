import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { type UserData } from "../types/userTypes";
import api from "../services/api";

export const useUserData = () => {
  const { data: userData } = useQuery<UserData>({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await api.get("/user/me");
      return response.data;
    },
  });

  return {
    user: userData,
    prompts: userData?.prompts,
    role: userData?.role,
    isLoggedIn: !!userData,
  };
};

export const useUserFromId = (id: string) => {
  const { data: userName } = useQuery<string>({
    queryKey: ["userName", id],
    queryFn: async () => {
      const response = await api.get(`/user/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
  return {
    userName,
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
