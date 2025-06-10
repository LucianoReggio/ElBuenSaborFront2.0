// src/components/layout/PublicLayout.tsx
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Navbar from "./Navbar";
export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] bg-[#F7F7F5]">
        <Outlet />
      </main>
    </>
  );
}
