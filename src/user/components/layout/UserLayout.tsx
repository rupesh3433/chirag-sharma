import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <div className="min-h-screen w-full bg-background flex">
      {/* Main content column */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* This <main> is CRITICAL */}
        <main className="flex-1 w-full overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
