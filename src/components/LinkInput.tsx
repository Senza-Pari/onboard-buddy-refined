import React, { useState } from 'react';
import { Link as LinkIcon, Plus, X } from 'lucide-react';

interface Link {
  name: string;
  url: string;
}

interface LinkInputProps {
  links: Link[];
  onChange: (links: Link[]) => void;
}

const LinkInput: React.FC<LinkInputProps> = ({ links, onChange }) => {
  const [newLink, setNewLink] = useState<Link>({ name: '', url: '' });
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newLink.name && newLink.url) {
      onChange([...links, newLink]);
      setNewLink({ name: '', url: '' });
      setIsAdding(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {links.map((link, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-neutral-100 px-3 py-1 rounded-lg"
          >
            <LinkIcon size={14} className="text-neutral-500" />
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
            >
              {link.name}
            </a>
            <button
              onClick={() => handleRemove(index)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Link name"
            value={newLink.name}
            onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
            className="input-field"
          />
          <input
            type="url"
            placeholder="URL"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            className="input-field"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-sm text-neutral-600 hover:bg-neutral-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newLink.name || !newLink.url}
              className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
        >
          <Plus size={16} />
          Add Link
        </button>
      )}
    </div>
  );
};

export default LinkInput;