import { useState } from "react";
import "./addTask.css";
import { useTasks } from "../../hooks/useTasks";
import type { subCycle, itemStatus, ItemType, AppItem } from "../../types";
import { CategorySelect } from "./categorySelect";
export const AddItemModal = ({ 
  isOpen, 
  onClose, 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const {addTask, addSubscription} = useTasks();
  const [type, setType] = useState<'task' | 'subscription'>('task');
  const [title, setTitle] = useState('');
  const [dueDate, setdueDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [endDate,setEndDate] = useState<Date>(new Date());
  const [startDate,setStartDate] = useState<Date>(new Date());
  const [reminders, setReminders] = useState<Date[]>([]); 
  const [currentReminder, setCurrentReminder] = useState('');
  
  const [taskStatus, setTaskStatus] = useState<itemStatus>('Pending');
  const [billingCycle, setBillingCycle] = useState<subCycle>('Monthly');
  const [autoRenew, setAutoRenew] = useState(false);

  const handleAddReminder = () => {
    if (!currentReminder) return;
    const newReminderDate = new Date(currentReminder);
    setReminders([...reminders, newReminderDate]);
    setCurrentReminder('');
  };

  const handleRemoveReminder = (indexToRemove: number) => {
    setReminders(reminders.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    if (type === 'task') {
      addTask(title, dueDate, description, category, reminders, taskStatus);
    } else {
      addSubscription(
        title, startDate, endDate, description, category, 
        reminders, taskStatus, billingCycle, Number(amount), autoRenew
      );
    }
    
    setTitle(''); 
    setdueDate(new Date()); 
    setAmount(''); 
    setDescription(''); 
    setCategory(''); 
    setReminders([]);
    setCurrentReminder('');
    setAutoRenew(false)
    setStartDate(new Date()); 
    setEndDate(new Date()); 
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ margin: 0 }}>Add New Item</h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className={`btn-toggle ${type === 'task' ? 'active' : ''}`} onClick={() => setType('task')}>Task</button>
          <button type="button" className={`btn-toggle ${type === 'subscription' ? 'active' : ''}`} onClick={() => setType('subscription')}>Subscription</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input required type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          { type === "task" &&
          <>
              <label htmlFor="due-date" style={{ display: 'block', marginBottom: '5px' }}>
              Select Due Date:          
              </label>
              <input required type="date" placeholder="Choose your due date"
               value={dueDate.toISOString().split('T')[0]} onChange={(e) => {
              const val = e.target.value; if (val) {setdueDate(new Date(val));}}} />
              </>
            }
            { type === "subscription" &&
          <>
              <label htmlFor="start-date" style={{ display: 'block', marginBottom: '5px' }}>
              Select Start Date:          
              </label>
              <input required type="date" placeholder="Choose your start date"
               value={startDate.toISOString().split('T')[0]} onChange={(e) => {
              const val = e.target.value; if (val) {setStartDate(new Date(val));}}} />

              <label htmlFor="end-date" style={{ display: 'block', marginBottom: '5px' }}>
              Select End Date:          
              </label>
              <input required type="date" placeholder="Choose your end date"
               value={endDate.toISOString().split('T')[0]} onChange={(e) => {
              const val = e.target.value; if (val) {setEndDate(new Date(val));}}} />
              </>
            }
          

          <input required type="text" placeholder="Description" value={description} onChange={(e)=> setDescription(e.target.value)}/>
          <CategorySelect selectedCategory={category} onChange={(category:string) => setCategory(category)} />
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
          {type === 'subscription' && (
            <>
              <input required type="number" step="0.1" placeholder="Monthly Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} />
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
            </>)
            
          }
          
          <button type="submit" className="btn-submit">Save Item</button>
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};