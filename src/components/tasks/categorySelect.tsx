import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';

interface CategorySelectProps {
  selectedCategory: string;
  onChange: (category: string) => void;
}

const DEFAULT_CATEGORIES = [
  'Entertainment', 'Cloud & Infrastructure', 'Software & Tools', 'Utilities',
  'Academic', 'Personal', 'Finance'
];

export const CategorySelect = ({ selectedCategory, onChange }: CategorySelectProps) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const savedCategories = useLiveQuery(() => db.categories.toArray()) || [];
  
  const allCategories = Array.from(new Set([
    ...DEFAULT_CATEGORIES, 
    ...savedCategories.map(cat => cat.name)
  ]));

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'ADD_NEW') {
      setIsAddingNew(true);
      onChange('');
    } else {
      onChange(e.target.value);
    }
  };

  const handleSaveNewCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setIsAddingNew(false);
      return;
    }

    await db.categories.put({ name: trimmed });
    
    onChange(trimmed);
    setNewCategoryName('');
    setIsAddingNew(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      
      {!isAddingNew ? (
        <select 
          value={selectedCategory} 
          onChange={handleSelectChange}
          style={{
            background: 'var(--bg-main)', color: 'white', border: '1px solid var(--border-color)', 
            padding: '12px', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', appearance: 'auto'
          }}
        >
          <option value="" disabled>Select a Category...</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
          <option disabled>──────────</option>
          <option value="ADD_NEW" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
            + Add New Category...
          </option>
        </select>
      ) : (

        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            autoFocus
            placeholder="Type new category..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--accent)', background: 'var(--bg-main)', color: 'white' }}
          />
          <button 
            type="button" 
            onClick={handleSaveNewCategory}
            style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '0 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Save
          </button>
          <button 
            type="button" 
            onClick={() => setIsAddingNew(false)}
            style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};