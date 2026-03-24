import { useState } from "react";
import "./App.css"
import { Sidebar } from "./components/layout/sidebar";
import { Header } from "./components/layout/header";
import { DashboardGrid } from "./components/layout/dashboardGrid"
import { AddItemModal } from "./components/tasks/addTask";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <section className="app-layout">
        <Sidebar/>
        <div className="app-layout-main">
          <div className="app-header">
            <Header  onAddClick={() => setIsModalOpen(true)}/>
          </div>
          <DashboardGrid/>
        </div>
      </section>
      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
    </>
  );
}