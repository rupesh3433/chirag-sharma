import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

const AdminApp = lazy(() => import("./admin/AdminApp"));
const UserApp = lazy(() => import("./user/UserApp"));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
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
