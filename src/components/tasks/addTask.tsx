import { useState } from "react";
import "./addTask.css";
import { useTasks } from "../../hooks/useTasks";
import type { subCycle, itemStatus, ItemType, AppItem } from "../../types";
import { CategorySelect } from "./categorySelect";
import { calculateNextBillingDate } from "../../utils/dateUtils";


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
  const [nextBillingDate,setNextBillingDate] = useState<Date>(new Date());
  const [reminders, setReminders] = useState<Date[]>([]); 
  const [currentReminder, setCurrentReminder] = useState('');
  const [prevBillingDate, setPrevBillingDate] = useState<Date>(new Date());
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
        title, startDate, endDate, nextBillingDate, prevBillingDate, description, category, 
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
    setBillingCycle("Monthly");
    setPrevBillingDate(new Date());
    setNextBillingDate(calculateNextBillingDate(startDate,billingCycle));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Item</h2>
        
        <div className="add-item-selector">
          <button type="button" className={`btn-toggle ${type === 'task' ? 'active' : ''}`} onClick={() => setType('task')}>Task</button>
          <button type="button" className={`btn-toggle ${type === 'subscription' ? 'active' : ''}`} onClick={() => setType('subscription')}>Subscription</button>
        </div>
        
        <form className="add-item-submit" onSubmit={handleSubmit}>
          <input required type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          {type === "task" &&
          <>
              <label className="add-item-date" htmlFor="due-date">
              Select Due Date:          
              </label>
              <input required type="date" placeholder="Choose your due date"
               value={dueDate.toISOString().split('T')[0]} onChange={(e) => {
              const val = e.target.value; if (val) {setdueDate(new Date(val));}}} />
              </>
            }
            {type === "subscription" &&
          <>
              <label className="add-item-date" htmlFor="start-date">
              Select Start Date:          
              </label>
              <input required type="date" placeholder="Choose your start date"
               value={startDate.toISOString().split('T')[0]} onChange={(e) => {
              const val = e.target.value; if (val) {setStartDate(new Date(val));}}} />

              <label className="add-item-date" htmlFor="end-date">
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
              <input type="datetime-local" value={currentReminder} onChange={(e)=> setCurrentReminder(e.target.value)}/>
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
              <select className="billing-cycle" name="billing-cycle" required value = {billingCycle} onChange={(e)=> setBillingCycle(e.target.value as subCycle)}>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Weekly">Weekly</option>
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
          {type==="task" && <button type="submit" className="btn-submit">Save Item</button>}
          
          {type==="subscription" && <button type="submit" className="btn-submit" onClick={()=>{
            setPrevBillingDate(startDate);
            setNextBillingDate(calculateNextBillingDate(startDate,billingCycle))}}>Save Item</button>}
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};