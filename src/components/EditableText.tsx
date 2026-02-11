import React, { useState, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import useSettingsStore from '../stores/settingsStore';

interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const EditableText: React.FC<EditableTextProps> = ({
  id,
  defaultText,
  className = '',
  as: Component = 'p',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(defaultText);
  const { customTexts, updateCustomText } = useSettingsStore();

  useEffect(() => {
    if (customTexts[id]) {
      setText(customTexts[id]);
    }
  }, [id, customTexts]);

  const handleSave = () => {
    updateCustomText(id, text);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(customTexts[id] || defaultText);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="relative group inline-block">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input-field py-1 px-2 min-w-[200px]"
          autoFocus
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button
            onClick={handleSave}
            className="p-1 text-primary-600 hover:text-primary-700"
          >
            <Check size={16} />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-neutral-600 hover:text-neutral-700"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <Component
      className={`group relative cursor-text ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {text}
      <Edit2
        size={14}
        className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-neutral-400"
      />
    </Component>
  );
};

export default EditableText;