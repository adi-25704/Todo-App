import React, { useState, useEffect } from 'react';
import type { AppItem } from '../../types';
import {db} from "../../db.ts"
import type Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';

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
  const [isEditing, setIsEditing] = useState(false);
  setSelectedItem(item); // Set the data to show
  setIsOpen(true);  
  // Form state for editing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState(0);
  // Sync state when a new item is opened or edit mode is toggled
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || '');
      setCategory(item.category || '');
      setDueDate(item.dueDate);
      if (item.type === 'subscription') {
        setAmount(item.amount);
      }
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
      dueDate,
      ...(item.type === 'subscription' && { amount })
    };
    handleUpdateItem(updatedItem);
    setSelectedItem(updatedItem)
    setIsEditing(false); // Switch back to view mode after saving
    
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
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
              <span style={{ padding: '4px 8px', background: 'var(--bg-main)', borderRadius: '4px', fontSize: '12px', textTransform: 'uppercase' }}>
                {item.type}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', color: 'var(--text-muted)' }}>
              <p><strong>Due Date:</strong> {item.dueDate.toLocaleDateString()}</p>
              {item.type === 'subscription' && <p><strong>Amount:</strong> ₹{item.amount}</p>}
              <p><strong>Category:</strong> {item.category || 'None'}</p>
              <p><strong>Description:</strong> {item.description || 'No description provided.'}</p>
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
            
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Due Date</label>
            <input required type="date" value={dueDate.toISOString().split('T')[0]} onChange={(e) => {
              const val = e.target.value; if (val) setDueDate(new Date(val));
            }} />

            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Category</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />

            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'white', padding: '12px', borderRadius: '8px', minHeight: '80px', fontFamily: 'inherit' }}
            />

            {item.type === 'subscription' && (
              <>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Amount (₹)</label>
                <input required type="number" step="0.1" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
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