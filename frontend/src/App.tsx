import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Login from "./pages/Login/Login";
import NotFound from "./pages/NotFound/NotFound";

import Home from "./pages/Home/Home";
import Generate from "./pages/Generate/Generate";
import History from "./pages/History/History";
import Profiles from "./pages/Profiles/Profiles";
import AdminPanel from "./pages/Admin/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import PrivacyPolicie from "./pages/Privacy/PrivacyPolicie";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/privacy_policie" element={<PrivacyPolicie />}/>
          <Route path="*" element={<NotFound />} />

          <Route element={<ProtectedRoute />}>
            <Route index element={<Home />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/history" element={<History />} />
            <Route path="/accounts" element={<Profiles />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
