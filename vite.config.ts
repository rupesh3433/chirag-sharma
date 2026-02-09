import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Root (rarely used directly)
      "@": path.resolve(__dirname, "src"),

      // ✅ SHARED (used by BOTH admin + user)
      "@shared": path.resolve(__dirname, "src/shared"),

      // ✅ ROLE-SPECIFIC (ISOLATED)
      "@admin": path.resolve(__dirname, "src/admin"),
      "@user": path.resolve(__dirname, "src/user"),
    },
  },
});
