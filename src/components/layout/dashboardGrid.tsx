import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useTasks } from '../../hooks/useTasks';
import { getDaysUntil } from '../../utils/dateUtils';
import "./dashboardGrid.css";
import type { AppItem, subCycle, Subscription, Task } from '../../types';
import { ViewTaskModal } from '../tasks/viewAndEditTask';
import { useState, useEffect, useMemo } from 'react';
import { calculateNextBillingDate } from '../../utils/dateUtils';

export const DashboardGrid = () => {
  const { deleteItem, toggleTask } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const rawItems = useLiveQuery(() => db.items.toArray()) || [];
  const categories = useLiveQuery(() => db.categories.toArray()) || [];
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



  // 2. Control State for Sorting and Filtering
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'dueDate' | 'cost'>('newest');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed' | 'Overdue'>('All');
  const [filterUrgency, setFilterUrgency] = useState<'All' | 'Safe' | 'Near' | 'Overdue'>('All');

  // Timer to force re-render for accurate "Days Left" countdowns
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 3600000); // 1 hour
    return () => clearInterval(interval);
  }, []);

  // 3. The Processing Engine
  const processedData = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // --- STEP A: FILTERING ---
    let filtered = rawItems.filter(item => {
      // Category Filter
      if (filterCategory !== 'All' && item.category !== filterCategory) return false;

      // Status Filter Calculation
      const itemDate = item.type === 'task' ? new Date(item.dueDate) : new Date(item.nextBillingDate);
      itemDate.setHours(0, 0, 0, 0);
      const isOverdue = item.taskStatus === 'Pending' && itemDate < now && !(item.type === 'subscription' && item.autoRenew);
      
      let computedStatus = 'Pending';
      if (item.taskStatus === 'Completed') computedStatus = 'Completed';
      else if (isOverdue) computedStatus = 'Overdue';

      if (filterStatus !== 'All' && computedStatus !== filterStatus) return false;

      // Subscription Urgency Filter (Only applies to subs)
      if (item.type === 'subscription' && filterUrgency !== 'All') {
        const daysLeft = getDaysUntil(item.nextBillingDate);
        let urgency = 'Safe';
        if (computedStatus === 'Overdue') urgency = 'Overdue';
        else if (daysLeft <= 5 && item.taskStatus !== 'Completed') urgency = 'Near';
        
        if (urgency !== filterUrgency) return false;
      }

      return true;
    });

    // --- STEP B: SORTING ---
    filtered.sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt.getTime() - a.createdAt.getTime();
      if (sortBy === 'oldest') return a.createdAt.getTime() - b.createdAt.getTime();
      
      if (sortBy === 'dueDate') {
        const dateA = a.type === 'task' ? a.dueDate.getTime() : a.nextBillingDate.getTime();
        const dateB = b.type === 'task' ? b.dueDate.getTime() : b.nextBillingDate.getTime();
        return dateA - dateB; // Soonest first
      }
      
      if (sortBy === 'cost') {
        // Treat tasks as cost 0 so they drop to the bottom
        const costA = a.type === 'subscription' ? a.amount : 0;
        const costB = b.type === 'subscription' ? b.amount : 0;
        return costB - costA; // Highest cost first
      }
      return 0;
    });

    // --- STEP C: SPLIT INTO TASKS AND SUBS FOR RENDERING ---
    return {
      tasks: filtered.filter((item): item is Task => item.type === 'task'),
      subs: filtered.filter((item): item is Subscription => item.type === 'subscription')
    };
  }, [rawItems, sortBy, filterCategory, filterStatus, filterUrgency]);

  return (
    <div className="dashboard-main">
      
      {/* --- CONTROLS BAR --- */}
      <div style={{ 
        display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px', 
        background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)'
      }}>
        
        {/* Sort Dropdown */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="filter-select">
          <option value="newest">Sort: Added (Newest)</option>
          <option value="oldest">Sort: Added (Oldest)</option>
          <option value="dueDate">Sort: Due Date (Soonest)</option>
          <option value="cost">Sort: Monthly Cost (Highest)</option>
        </select>

        {/* Category Filter */}
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
          <option value="All">All Categories</option>
          {categories.map(cat => (
            <option key={cat.name} value={cat.name}>{cat.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="filter-select">
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Overdue">Overdue</option>
        </select>

        {/* Subscription Urgency Filter */}
        <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value as any)} className="filter-select">
          <option value="All">Sub Urgency: All</option>
          <option value="Safe">Safe ({'>'}5 Days)</option>
          <option value="Near">Near Deadline (≤5 Days)</option>
          <option value="Overdue">Overdue</option>
        </select>

      </div>
      <h2 className="section-title">Upcoming Renewals</h2>
      <div className="cards-grid">
        {processedData.subs.map((sub) => {
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
        {processedData.subs.length === 0 && <p className='placeholder'>No subscriptions added yet.</p>}
      </div>
      <h2 className="section-title">Today's Tasks</h2>
      <div className="task-list">
        {processedData.tasks.map((task) => (
          <div key={task.id} className="task-item">
            <input type="checkbox" className="task-checkbox" checked={task.taskStatus === "Completed"}
              onChange={()=> task.taskStatus==="Completed"?toggleTask(task.id,"Pending"):toggleTask(task.id,"Completed")}/>
            <span className={`task-title ${task.taskStatus==="Completed" ? 'completed' : ''}`}>
              {task.title}
            </span>
            <div className="btns-task">
              
              <button className="view-btn" onClick={() => setSelectedItem(task)}>👁</button>
              <button className="delete-btn" onClick={() => deleteItem(task.id)}>✕</button>
            </div>
          </div>
        ))}
        {processedData.tasks.length === 0 && <p className='placeholder'>No tasks for today.</p>}
      </div>
    </div>
  );
};