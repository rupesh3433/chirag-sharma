import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import FullScreenLoader from "./shared/components/FullScreenLoader";

const AdminApp = lazy(() => import("./admin/AdminApp"));
const UserApp = lazy(() => import("./user/UserApp"));

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ADMIN */}
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<FullScreenLoader />}>
              <AdminApp />
            </Suspense>
          }
        />

        {/* USER */}
        <Route
          path="/*"
          element={
            <Suspense fallback={<FullScreenLoader />}>
              <UserApp />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
