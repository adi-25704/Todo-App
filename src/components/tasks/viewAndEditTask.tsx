import React, { useState, useEffect, type ChangeEvent } from 'react';
import type { AppItem } from '../../types';
import {db} from "../../db.ts"
import type Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTasks } from '../../hooks/useTasks.ts';
import "./viewAndEditTask.css"
import "./addTask.css"
import type { itemStatus, subCycle } from '../../types';
import { CategorySelect } from './categorySelect.tsx';

export const ViewTaskModal = ({ 
  item, 
  setIsOpen, 
  setSelectedItem ,
  onClose,
}: { 
  item: AppItem; 
  setIsOpen: (val: boolean) => void; 
  setSelectedItem: (item: AppItem | null) => void; 
  onClose: () => void;
}) => {
  const {toggleTask} = useTasks()
  const [isEditing, setIsEditing] = useState(false);
  setSelectedItem(item); // Set the data to show
  setIsOpen(true);  
  // Form state for editing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState(0);
  const [startDate,setStartDate]=useState(new Date());
  const [taskStatus,setTaskStatus] = useState<itemStatus>("Pending");
  const [type, setType] = useState<'task' | 'subscription'>('task');
  const [endDate,setEndDate] = useState<Date>(new Date());
  const [reminders, setReminders] = useState<Date[]>([]); 
  const [billingCycle, setBillingCycle] = useState<subCycle>('Monthly');
  const [autoRenew, setAutoRenew] = useState(false);
  const [currentReminder, setCurrentReminder] = useState('');
  // Sync state when a new item is opened or edit mode is toggled
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || '');
      setCategory(item.category || '');
      setType(item.type)
      if(item.type === 'task')
      {
        setDueDate(item.dueDate);
      }
      if (item.type === 'subscription') 
      {
        setStartDate(item.startDate);
        setEndDate(item.endDate);
        setBillingCycle(item.billingCycle);
        setAutoRenew(item.autoRenew);
        setAmount(item.amount);
      }
      setTaskStatus(item.taskStatus);
      setReminders(item.reminders);
    }
    // Always start in view mode when opening a new item
    setIsEditing(false); 
  }, [item]);

  if (!item) return null;

  const handleSave = (e: React.SubmitEvent) => {
    e.preventDefault();
    
    // Merge the updated fields back into the original item
    const updatedItem = {
      ...item,
      title,
      description,
      category,
      ...(item.type ==='task' && {dueDate}),
      taskStatus,
      reminders,
      
      ...(item.type === 'subscription' && { amount, startDate, endDate, billingCycle, autoRenew})
    };
    handleUpdateItem(updatedItem);
    setSelectedItem(updatedItem)
    setIsEditing(false); // Switch back to view mode after saving
    
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleAddReminder = () => {
    if (!currentReminder) return;
    const newReminderDate = new Date(currentReminder);
    setReminders([...reminders, newReminderDate]);
    setCurrentReminder('');
  };

  const handleRemoveReminder = (indexToRemove: number) => {
    setReminders(reminders.filter((_, index) => index !== indexToRemove));
  };

  const handleUpdateItem = async (updatedItem: AppItem) => {
    await db.items.put(updatedItem); // .put() updates if the ID exists
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      {/* Stop click from closing modal when clicking inside the content box */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* --- VIEW MODE --- */}
        {!isEditing ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

            <h2 style={{ margin: 0, color: 'var(--text-main)' }}>{item.title}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px'}}>
              
              <span style={{ padding: '4px 8px', background: 'var(--bg-main)', borderRadius: '4px', fontSize: '12px', textTransform: 'uppercase' }}>
                {item.type}
              </span>
              
              {item.type === "subscription" && !item.autoRenew && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <input 
                    type="checkbox" 
                    className="pay-checkbox" 
                    checked={item.taskStatus === "Completed"} 
                    onChange={() => {
                      const newStatus = item.taskStatus === "Pending" ? "Completed" : "Pending";
                      toggleTask(item.id, newStatus);
                      setTaskStatus(newStatus);
                      setSelectedItem({ ...item, taskStatus: newStatus as itemStatus });
                    }}
                  />
                  Amount Paid
                </div>)}
              </div>
            </div>
                
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', color: 'var(--text-muted)' }}>
              {item.type==="task"&& <p><strong>Due Date:</strong> {item.dueDate.toLocaleDateString()}</p>}
              {item.type==="subscription"&& 
              <><p><strong>Start Date:</strong> {item.startDate.toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {item.endDate.toLocaleDateString()}</p></>}
              {item.type === 'subscription' && <p><strong>Amount:</strong> ₹{item.amount}</p>}
              <p><strong>Category:</strong> {item.category || 'None'}</p>
              <p><strong>Description:</strong> {item.description || 'No description provided.'}</p>
              {item.type==="subscription" &&
              <>
                  <p><strong>Billing Cycle:</strong> {item.billingCycle}</p>
                  <p><strong>Auto-Renew:</strong>{item.autoRenew?" Yes":" No"}</p>
              </>}
              {item.reminders.length !== 0 ? <><p><strong>Reminders:</strong><ul>
                  {item.reminders.map((date, index) => (
                    <li key={index}>{date.toLocaleString()}</li>
                  ))}
                </ul></p></>:<p><strong>Reminders: </strong>None</p>}
              <p><strong>Status:</strong> {item.taskStatus}</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn-submit" style={{ flex: 1, background: 'var(--accent)' }} onClick={() => setIsEditing(true)}>
                Edit Item
              </button>
              <button className="btn-cancel" onClick={handleClose}>Close</button>
            </div>
          </>
        ) : (
          
        /* --- EDIT MODE --- */
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ margin: 0, marginBottom: '8px' }}>Edit {item.type === 'task' ? 'Task' : 'Subscription'}</h2>
            
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Title</label>
            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            {item.type==='task' && 
            <>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Due Date</label>
              <input required type="date" value={dueDate.toISOString().split('T')[0]} onChange={(e) => {
                const val = e.target.value; if (val) setDueDate(new Date(val));}} />
            </>}
            {item.type==='subscription' && 
            <>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Start Date</label>
              <input required type="date" value={startDate.toISOString().split('T')[0]} onChange={(e) => {
                const val = e.target.value; if (val) setStartDate(new Date(val));}} />
              
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>End Date</label>
              <input required type="date" value={endDate.toISOString().split('T')[0]} onChange={(e) => {
                const val = e.target.value; if (val) setEndDate(new Date(val));}} />

            </>}

            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Category</label>
            <CategorySelect selectedCategory={category} onChange={(category:string) => setCategory(category)}/>

            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'white', padding: '12px', borderRadius: '8px', minHeight: '80px', fontFamily: 'inherit' }}
            />

            <div className="custom-reminders">
              <label className="custom-reminders-label">Custom Reminders</label>
              <div className="reminder-input">
                <input type="datetime-local" value={currentReminder} onChange={(e)=> setCurrentReminder(e.target.value)} style={{ flex: 1 }}/>
                <button type="button" className="add-button" onClick={handleAddReminder}>
                  Add
                </button>
              </div>

              {reminders.length > 0 && (
                <ul>
                  {reminders.map((rem, index) => (
                    <li key={index} >
                      <span>{rem.toLocaleString()}</span>
                      <button className="remove-reminder" type="button" onClick={() => handleRemoveReminder(index)}>✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {item.type === 'subscription' && (
              <>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Amount (₹)</label>
                <input required type="number" step="0.1" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />

                {/* <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>A</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} /> */}
                
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Billing Cycle</label>
                <select name="billing-cycle" required value = {billingCycle} onChange={(e)=> setBillingCycle(e.target.value as subCycle)}>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Weekly">Weekly</option>
                <option value="Daily">Daily</option>
              </select>
              <div className="autorenew">
                <input type="checkbox" 
                className="autorenew-checkbox" 
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}/>
                <span className="autorenew-tag">Auto Renew Set</span>
              </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="btn-submit" style={{ flex: 1, background: 'var(--success)' }}>
                Save Changes
              </button>
              <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};