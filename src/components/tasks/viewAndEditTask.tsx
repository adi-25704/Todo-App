import React, { useState, useEffect, type ChangeEvent } from 'react';
import type { AppItem } from '../../types';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTasks } from '../../hooks/useTasks.ts';
import "./viewAndEditTask.css"
import "./addTask.css"
import type { itemStatus, subCycle } from '../../types';
import { CategorySelect } from './categorySelect.tsx';
import { calculateNextBillingDate } from '../../utils/dateUtils.ts';

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
  const {handleUpdateItem} = useTasks()
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
  const [nextBillingDate,setNextBillingDate] = useState<Date>(new Date())
  const [prevBillingDate, setPrevBillingDate] = useState<Date>(new Date());
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
      setType(item.type);
      setTaskStatus(item.taskStatus);
      setReminders(item.reminders || []);

      if(item.type === 'task') {
        setDueDate(item.dueDate);
      }
      
      if (item.type === 'subscription') {
        setStartDate(item.startDate);
        setEndDate(item.endDate || new Date());
        setBillingCycle(item.billingCycle);
        setAutoRenew(item.autoRenew);
        setNextBillingDate(item.nextBillingDate);
        setPrevBillingDate(item.prevBillingDate || item.startDate);
      }
    }
    setIsEditing(false); 
  }, [item]);

  if (!item) return null;

  const handleSave = (e: React.SubmitEvent) => {
    e.preventDefault();

    const updatedItem = {
      ...item,
      title,
      description,
      category,
      ...(item.type ==='task' && {dueDate}),
      taskStatus,
      reminders,      
      ...(item.type === 'subscription' && { amount, startDate, endDate, nextBillingDate, prevBillingDate, billingCycle, autoRenew})
    };
    handleUpdateItem(updatedItem);
    setSelectedItem(updatedItem)
    setIsEditing(false);
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

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* --- VIEW MODE --- */}
        {!isEditing ? (
          <>
            <div className='item-view-header'>
              <h2 className='item-view-title'>{item.title}</h2>
              <div className='item-view-type'>
                <span>{item.type}</span>
                {item.type === "subscription" && !item.autoRenew && (
                  <div className='item-view-autorenew'>
                    <input type="checkbox" className="pay-checkbox" checked={item.taskStatus === "Completed"}  
                      onChange={() => {
                        const newStatus = item.taskStatus === "Pending" ? "Completed" : "Pending";
                        
                        let updatedItem = { ...item, taskStatus: newStatus as itemStatus };

                        if (newStatus === "Completed") {
                          updatedItem = {
                            ...updatedItem,
                            prevBillingDate: item.nextBillingDate,
                            nextBillingDate: calculateNextBillingDate(item.nextBillingDate, item.billingCycle)
                          };
                        } else {
                          updatedItem = {
                            ...updatedItem,
                            nextBillingDate: item.prevBillingDate || item.startDate
                          };
                        }

                        handleUpdateItem(updatedItem); 
                        setSelectedItem(updatedItem);
                        setTaskStatus(newStatus); 
                      }}
                    />
                    Amount Paid
                  </div>)}
                </div>
              </div>
                
            
            <div className='item-view-content'>
              <p><strong>Category:</strong> {item.category || 'None'}</p>
              <p><strong>Description:</strong> {item.description || 'No description provided.'}</p>
              
              {item.type==="task" && 
                <p><strong>Due Date:</strong> {item.dueDate.toLocaleDateString()}</p>
              }
            
              {item.type==="subscription"&& 
                <>
                  <p><strong>Start Date:</strong> {item.startDate.toLocaleDateString()}</p>
                  <p><strong>End Date:</strong> {item.endDate.toLocaleDateString()}</p>
                  <p><strong>Next Billing Date:</strong> {item.nextBillingDate.toLocaleDateString()}</p>
                  <p><strong>Amount:</strong> ₹{item.amount}</p>
                  <p><strong>Billing Cycle:</strong> {item.billingCycle}</p>
                  <p><strong>Auto-Renew:</strong>{item.autoRenew?" Yes":" No"}</p>
                </>
              }

              {item.reminders.length !== 0 ? 
                <>
                  <p><strong>Reminders:</strong>
                    <ul>
                      {item.reminders.map((date, index) => (
                        <li key={index}>{date.toLocaleString()}</li>
                      ))}
                    </ul>
                  </p>
                </>
                :
                <p><strong>Reminders: </strong>None</p>
              }
              <p><strong>Status:</strong> {item.taskStatus}</p>
            </div>

            <div className='item-view-submit'>
              <button className="btn-submit" onClick={() => setIsEditing(true)}>
                Edit Item
              </button>
              <button className="btn-cancel" onClick={handleClose}>Close</button>
            </div>
          </>
        ) : (
          
        /* --- EDIT MODE --- */
          <form onSubmit={handleSave} className='item-edit-form'>
            <h2 className='item-edit-type'>
              Edit {item.type === 'task' ? 'Task' : 'Subscription'}
            </h2>
            
            <label className='item-edit-title'>Title</label>
            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            {item.type==='task' && 
            <>
              <label>Due Date</label>
              <input required type="date" value={dueDate.toISOString().split('T')[0]} onChange={(e) => {
                const val = e.target.value; if (val) setDueDate(new Date(val));}} />
            </>}
            {item.type==='subscription' && 
            <>
              <label>Start Date</label>
              <input required type="date" value={startDate.toISOString().split('T')[0]} onChange={(e) => {
                const val = e.target.value; 
                if (val){
                  const newStartDate = new Date(val);
                  setStartDate(newStartDate);
                  setPrevBillingDate(newStartDate)
                  setNextBillingDate(calculateNextBillingDate(newStartDate, item.billingCycle))
                }}} />
              
              <label>End Date</label>
              <input required type="date" value={endDate.toISOString().split('T')[0]} onChange={(e) => {
                const val = e.target.value; if (val) setEndDate(new Date(val));}} />

            </>}

            <label>Category</label>
            <CategorySelect selectedCategory={category} onChange={(category:string) => setCategory(category)}/>

            <label>Description</label>
            <textarea className='item-edit-description'
              value={description} 
              onChange={(e) => setDescription(e.target.value)}/>

            <div className="custom-reminders">
              <label className="custom-reminders-label">Custom Reminders</label>
              <div className="reminder-input">
                <input className='item-edit-reminder' type="datetime-local" value={currentReminder} 
                onChange={(e)=> setCurrentReminder(e.target.value)}/>
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
                <label>Amount (₹)</label>
                <input required type="number" step="0.1" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /> 

                <label>Billing Cycle</label>
                <select className="billing-cycle" name="billing-cycle" required value = {billingCycle} onChange={(e)=> setBillingCycle(e.target.value as subCycle)}>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Weekly">Weekly</option>
                </select>
                <div className="autorenew">
                  <input type="checkbox" className="autorenew-checkbox" checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}/>
                  <span className="autorenew-tag">Auto Renew Set</span>
                </div>
              </>
            )}

            <div className='item-edit-submit'>
              <button type="submit" className="btn-submit">
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