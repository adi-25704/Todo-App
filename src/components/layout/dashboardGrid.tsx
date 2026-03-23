import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useTasks } from '../../hooks/useTasks';
import { getDaysUntil } from '../../utils/dateUtils';
import "./dashboardGrid.css"
import type { AppItem, subCycle, Subscription, Task } from '../../types';
import { ViewTaskModal } from '../tasks/viewAndEditTask';
import { useState } from 'react';
// export const DashboardGrid = () => {
//   // Automatically fetches and sorts by due date
//   const items = useLiveQuery(() => db.items.orderBy('dueDate').toArray());

//   const deleteItem = (id: string) => db.items.delete(id);

//   if (!items) return <div style={{ color: 'var(--text-muted)' }}>Loading schedule...</div>;

//   return (
//     <div className="list-container">
//       <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Schedule</h2>
//       {items.map(item => (
//         <div key={item.id} className="item-card">
//           <div className="item-info">
//             <h3>{item.title}</h3>
//             <p>
//               {item.type === 'subscription' ? `₹${(item as any).amount} • ` : ''}
//               Due: {item.dueDate.toLocaleDateString()}
//             </p>
//           </div>
//           <button 
//             className="delete-btn" 
//             onClick={() => deleteItem(item.id)}
//             title="Delete item"
//           >
//             ✕
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// };

export const DashboardGrid = () => {
  const { deleteItem, toggleTask } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  // Dexie automatically fetches and updates the UI when data changes!
  const subscriptions = useLiveQuery(() => db.items.where('type').equals('subscription').toArray()) as Subscription[] || [];
  const tasks = useLiveQuery(() => db.items.where('type').equals('task').toArray()) as Task[] || [];
  const [selectedItem, setSelectedItem] = useState<AppItem|null>(null);
  const cycleLabels: Record<subCycle, string> = {
  Monthly: "mo",
  Yearly: "yr",
  Weekly: "wk",
  Daily: "day"
  };

  return (
    <div className="dashboard-main">
      <h2 className="section-title">Upcoming Renewals</h2>
      
      <div className="cards-grid">
        {subscriptions.map((sub) => {
          const days = getDaysUntil(sub.dueDate);
          const isUrgent = days <= 5;
          return (<>
            {selectedItem && <ViewTaskModal item={selectedItem} 
                              setIsOpen={setIsOpen} 
                              setSelectedItem={setSelectedItem} onClose={() => setSelectedItem(null)} />}
            <div key={sub.id} className="sub-card"> 
              {/* <span className="sub-icon">{sub.icon}</span> */}
              <div>
                <h3 className="sub-title">{sub.title}</h3>
                <p className="sub-price">₹{sub.amount.toFixed(2)}/{cycleLabels[sub.billingCycle]}</p> 
                <p className="description">{sub.description}</p>
                {sub.autoRenew && <div className={`due-pill ${isUrgent ? 'urgent' : 'safe'}`}>
                  Auto-renews IN {days}D
                </div>}
                {!sub.autoRenew && <div className={`due-pill ${isUrgent ? 'urgent' : 'safe'}`}>
                  DUE IN {days}D
                </div>}
                <div className="btns-sub"> 
                  <button className="view-btn" onClick={() => setSelectedItem(sub)}>👁</button>
                  <button className="delete-btn" onClick={() => deleteItem(sub.id)}>✕</button>
                    
                </div>
            </div>
            </div>
            </>
          );
        })}
        {subscriptions.length === 0 && <p style={{color: 'var(--text-muted)'}}>No subscriptions added yet.</p>}
      </div>

      <h2 className="section-title">Today's Tasks</h2>
      
      <div className="task-list">
        {tasks.map((task) => (
          <div key={task.id} className="task-item">
            <input 
              type="checkbox" 
              className="task-checkbox" 
              checked={task.taskStatus === "Completed"}
              onChange={()=> task.taskStatus==="Completed"?toggleTask(task.id,"Pending"):toggleTask(task.id,"Completed")}
            />
            <span className={`task-title ${task.taskStatus==="Completed" ? 'completed' : ''}`}>
              {task.title}
            </span>
            <div className="btns-task">
              
            <button className="view-btn" onClick={() => setSelectedItem(task)}>👁</button>
            <button className="delete-btn" style={{ position: 'relative', top: 0, right: 0, marginLeft: 'auto' }} onClick={() => deleteItem(task.id)}>✕</button>
          </div>
          </div>
        ))}
        {tasks.length === 0 && <p style={{color: 'var(--text-muted)'}}>No tasks for today.</p>}
      </div>
    </div>

  );
};

