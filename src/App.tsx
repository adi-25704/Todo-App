import { useEffect,useState } from "react";
import type { AppItem } from "./types";
import "./App.css"
import { Sidebar } from "./components/layout/sidebar";
import { Header } from "./components/layout/header";
import {DashboardGrid} from "./components/layout/dashboardGrid"
import { AddItemModal } from "./components/tasks/addTask";
import { useTasks } from "./hooks/useTasks";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<AppItem[]>([]);
  // const {addTask, addSubscription, deleteItem, toggleTask } = useTasks();

  // Load from LocalStorage
  useEffect(() => {

  }, []);

  const saveItems = (newItems: AppItem[]) => {
    
  };

  return (
    <>
      <div className="app-layout">
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '48px 64px 0 64px' }}>
            <Header  onAddClick={() => setIsModalOpen(true)}/>
            
          </div>
          <DashboardGrid />
          {/* items={items} deleteItem={deleteItem} toggleTask={toggleTask}  */}
        </div>
      </div>
      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}