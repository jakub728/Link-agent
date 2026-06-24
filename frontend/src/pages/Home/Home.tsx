import { useUserData } from "../../hooks/userHooks";

export default function Home() {
  const { user } = useUserData();

  return <h1 style={{ marginTop: "100px" }}>Witaj spowrotem {user?.login}!</h1>;
}
