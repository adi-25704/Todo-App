import React, { useState} from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import "./categorySelect.css"

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
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...savedCategories.map(cat => cat.name)]));

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
    <div className='category-select-main'> 
      {!isAddingNew ? (
        <select className='category-select-selector' value={selectedCategory} onChange={handleSelectChange}>
          <option value="" disabled>Select a Category...</option>
          {allCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
          <option disabled>──────────</option>
          <option className='category-select-add-new' value="ADD_NEW">
            + Add New Category...
          </option>
        </select>
      ) : (
        <div className='category-select-text'>
          <input type="text" autoFocus placeholder="Type new category..." value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}/>

          <button className='category-select-submit' type="button" onClick={handleSaveNewCategory}>
            Save
          </button>
          <button className='category-select-cancel' type="button" onClick={() => setIsAddingNew(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};