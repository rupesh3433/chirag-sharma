import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import FullScreenLoader from "./shared/components/FullScreenLoader";

const AdminApp = lazy(() => import("./admin/AdminApp"));
const UserApp = lazy(() => import("./user/UserApp"));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<FullScreenLoader />}>
      <Routes>
          {/* ADMIN APPLICATION */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* USER APPLICATION */}
          <Route path="/*" element={<UserApp />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
