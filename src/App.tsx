import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import AdminApp from "./admin/AdminApp";
import UserApp from "./user/UserApp";

/**
 * Lazy-load apps to ensure:
 * - Admin code is not loaded for users
 * - User code is not loaded for admin
 */

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
