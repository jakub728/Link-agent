import { useState } from "react";
import { useCreateUser } from "../../hooks/adminHooks";
import style from "./Admin.module.css";

export default function AdminPanel() {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const { mutate, isPending } = useCreateUser();

  return (
    <div>
      <button
        className={style.buttonTop}
        onClick={() => setShowAddUserModal(!showAddUserModal)}
      >
        {showAddUserModal ? "Zamknij" : "Dodaj użytkownika"}
      </button>
      {showAddUserModal && (
        <div className={style.modal}>
          <h2>Dodaj użytkownika</h2>
          <input
            className={style.input}
            type="text"
            placeholder="Login"
            value={login}
            minLength={3}
            onChange={(e) => setLogin(e.target.value)}
          />
          <input
            className={style.input}
            type="password"
            placeholder="Hasło"
            value={password}
            minLength={8}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select
            className={style.input}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">Użytkownik</option>
            <option value="admin">Administrator</option>
          </select>
          <button
            className={style.button}
            onClick={() => mutate({ login, password, role })}
            disabled={isPending}
          >
            Dodaj
          </button>
          <button
            className={style.button}
            onClick={() => setShowAddUserModal(false)}
          >
            Anuluj
          </button>
        </div>
      )}
    </div>
  );
}
