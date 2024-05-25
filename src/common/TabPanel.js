import React from "react";

const TabPanel = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex-1 flex justify-center rounded-lg my-2">
      <div className="flex justify-around p-2 sm:px-4 bg-gradient-to-r from-[#7C01F6] via-purple-700 to-pink-500 rounded-2xl w-[90%]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-6 sm:px-10 py-1 rounded-2xl text-white  ${
              activeTab === tab.id ? "bg-[#000000]" : "bg-transparent"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabPanel;
