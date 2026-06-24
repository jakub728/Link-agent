import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";

export default function ProtectedRoute() {
  const { data: userData, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await api.get("/user/me");
      return response.data.user;
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <div
        style={{ color: "var(--text)", marginTop: "40px", textAlign: "center" }}
      >
        Weryfikacja sesji...
      </div>
    );
  }

  return userData ? <Outlet /> : <Navigate to="/login" replace />;
}
