import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useTasks } from '../../hooks/useTasks';
import { getDaysUntil } from '../../utils/dateUtils';
import "./dashboardGrid.css"
import type { AppItem, subCycle, Subscription, Task } from '../../types';
import { ViewTaskModal } from '../tasks/viewAndEditTask';
import { useState, useEffect } from 'react';
import { calculateNextBillingDate } from '../../utils/dateUtils';

export const DashboardGrid = () => {
  const { deleteItem, toggleTask } = useTasks();
  const [isOpen, setIsOpen] = useState(false);

  const rawItems = useLiveQuery(() => db.items.toArray()) || [];
  const subscriptions = useLiveQuery(() => db.items.where('type').equals('subscription').toArray()) as Subscription[] || [];
  const tasks = useLiveQuery(() => db.items.where('type').equals('task').toArray()) as Task[] || [];
  const [selectedItem, setSelectedItem] = useState<AppItem|null>(null);
  const [today, setToday] = useState(new Date());
  const cycleLabels: Record<subCycle, string> = {
  Monthly: "mo",
  Yearly: "yr",
  Weekly: "wk",
  };
  useEffect(() => {
    const interval = setInterval(() => setToday(new Date()), 3600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const silentlyUpdateAutoRenews = async () => {
      const now = new Date();

      const pastDueAuto = rawItems.filter(item => 
        item.type === 'subscription' && 
        item.autoRenew && 
        item.nextBillingDate < now
      );

      for (const item of pastDueAuto) {
        if (item.type === 'subscription') {
          const updatedItem = {
            ...item,
            prevBillingDate: item.nextBillingDate,
            nextBillingDate: calculateNextBillingDate(item.nextBillingDate, item.billingCycle)
          };
          await db.items.put(updatedItem);
        }
      }
    };

    if (rawItems.length > 0) {
      silentlyUpdateAutoRenews();
    }
  }, [rawItems]);

  return (
    <div className="dashboard-main">
      <h2 className="section-title">Upcoming Renewals</h2>
      
      <div className="cards-grid">
        {subscriptions.map((sub) => {
          const daysLeft = getDaysUntil(sub.nextBillingDate);
          const isOverdue = daysLeft < 0 && !sub.autoRenew && sub.taskStatus !== 'Completed';

          let pillClass;
          let pillText;

          if (sub.autoRenew) {
            pillClass = 'safe'; 
            pillText = `Auto-Renews in ${daysLeft}`
            if (daysLeft < 0) {
          
            pillText = 'RENEWING...'; 
            }
          } else {

            if (isOverdue) {
                pillClass = 'urgent'; 
                pillText = `OVERDUE by ${Math.abs(daysLeft)}D`;
            } else if (daysLeft <= 5) {
                pillClass = 'warning'; 
                pillText = `DUE IN ${daysLeft}D`
            } else{
              pillClass = 'safe';
              pillText = `DUE IN ${daysLeft}D`;
            }
          }
          return (<>
            {selectedItem && <ViewTaskModal item={selectedItem} 
                              setIsOpen={setIsOpen} 
                              setSelectedItem={setSelectedItem} onClose={() => setSelectedItem(null)} />}
            <div key={sub.id} className="sub-card"> 
              <div>
                <h3 className="sub-title">{sub.title}</h3>
                <p className="sub-price">₹{sub.amount.toFixed(2)}/{cycleLabels[sub.billingCycle]}</p> 
                <p className="description">{sub.description}</p>
                {sub.autoRenew && <div className={`due-pill ${pillClass}`}>
                  {pillText}
                </div>}
                {!sub.autoRenew && <div className={`due-pill ${pillClass}`}>
                  {pillText}
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
        {subscriptions.length === 0 && <p className='placeholder'>No subscriptions added yet.</p>}
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
            <button className="delete-btn" onClick={() => deleteItem(task.id)}>✕</button>
          </div>
          </div>
        ))}
        {tasks.length === 0 && <p className='placeholder'>No tasks for today.</p>}
      </div>
    </div>

  );
};

