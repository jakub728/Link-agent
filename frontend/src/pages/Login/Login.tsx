import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import style from "./Login.module.css";
import { Eye, EyeClosed } from "lucide-react";

export default function Login() {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/user/login", {
        login: loginInput,
        password,
      });
      return response.data.user;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["authUser"], userData);
      navigate("/");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Błąd logowania");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className={style.container}>
      <form onSubmit={handleSubmit} className={style.form}>
        <div className={style.element}>
          <label className={style.label}>Login</label>
          <div>
            <input
              className={style.input}
              type="text"
              value={loginInput}
              disabled={loginMutation.isPending}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Login"
              required
            />
          </div>
        </div>
        <div className={style.element}>
          <label className={style.label}>Hasło</label>
          <div className={style.passwordInput}>
            <input
              className={style.input}
              type={showPassword ? "text" : "password"}
              value={password}
              disabled={loginMutation.isPending}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={showPassword ? "Hasło..." : "*****"}
              required
            />
            {showPassword ? (
              <EyeClosed
                className={style.eye}
                onClick={() => {
                  setShowPassword(false);
                }}
              />
            ) : (
              <Eye
                className={style.eye}
                onClick={() => {
                  setShowPassword(true);
                }}
              />
            )}
          </div>
        </div>
        <button
          className={style.button}
          type="submit"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Logowanie..." : "Zaloguj się"}
        </button>
      </form>
    </div>
  );
}
