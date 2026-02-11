import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onAddNewTag?: (tag: string) => void;
  className?: string;
  showCount?: boolean;
  itemCount?: number;
  helperText?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  availableTags,
  selectedTags,
  onTagsChange,
  onAddNewTag,
  className = '',
  showCount = false,
  itemCount = 0,
  helperText
}) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (!tag) return;

    if (!availableTags.includes(tag) && onAddNewTag) {
      onAddNewTag(tag);
    }
    
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
    
    setNewTag('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={className}>
      {helperText && (
        <p className="text-sm text-neutral-600 mb-2">{helperText}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTags.map(tag => (
          <div key={tag} className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full text-sm">
            {tag}
            <button
              type="button"
              onClick={() => onTagsChange(selectedTags.filter(t => t !== tag))}
              className="hover:text-neutral-900"
            >
              <X size={14} />
            </button>
            {showCount && (
              <span className="ml-1 px-1.5 py-0.5 bg-neutral-200 text-neutral-700 rounded-full text-xs">
                {itemCount} items
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          className="input-field flex-1"
          placeholder="Add a new tag"
        />
        <button
          type="button"
          onClick={handleAddTag}
          disabled={!newTag.trim()}
          className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {availableTags.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {availableTags
              .filter(tag => !selectedTags.includes(tag))
              .map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagsChange([...selectedTags, tag])}
                  className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full text-sm hover:bg-neutral-200"
                >
                  {tag}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagInput;