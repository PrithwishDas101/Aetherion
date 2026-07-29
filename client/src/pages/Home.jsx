import React from "react";

import Header from "../components/Header.jsx";
import Sidebar from "../components/SideBar.jsx";

const Home = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#080d09]">
      <Header />
      <div className="m-[10px] flex w-[90%] flex-1 p-[10px]">

        < Sidebar />
        
        {/* CHAT AREA LAYOUT */}

      </div>

    </div>
  );
};

export default Home;