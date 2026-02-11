import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
