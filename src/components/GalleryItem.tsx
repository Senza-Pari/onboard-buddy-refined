import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, X, MapPin, Calendar, Lock, Globe, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import ImageUpload from './ImageUpload';
import type { GalleryItem as GalleryItemType } from '../stores/galleryStore';

interface GalleryItemProps {
  item: GalleryItemType;
  onEdit: (updates: Partial<GalleryItemType>) => void;
  onDelete: () => void;
  onCancel: () => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ 
  item, 
  onEdit, 
  onDelete,
  onCancel 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    if (!editedItem.title || !editedItem.content) return;
    onEdit(editedItem);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedItem(item);
    setIsEditing(false);
    onCancel();
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setEditedItem({
        ...editedItem,
        tags: [...editedItem.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedItem({
      ...editedItem,
      tags: editedItem.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleImageUpload = (file: File, croppedBlob?: Blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedItem({
        ...editedItem,
        imageUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(croppedBlob || file);
  };

  if (isEditing) {
    return (
      <motion.div
        className="card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Item</h2>
          <button
            onClick={handleCancel}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            className="input-field"
            value={editedItem.title}
            onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
          />

          {editedItem.type === 'photo' && (
            <ImageUpload
              onUpload={handleImageUpload}
              currentImageUrl={editedItem.imageUrl}
              className="mt-4"
            />
          )}

          <textarea
            placeholder="Write your content here..."
            className="input-field"
            rows={4}
            value={editedItem.content}
            onChange={(e) => setEditedItem({ ...editedItem, content: e.target.value })}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedItem.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-neutral-100"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-neutral-500 hover:text-neutral-700"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a new tag"
                className="input-field flex-1"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-neutral-100 rounded-lg hover:bg-neutral-200"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!editedItem.title || !editedItem.content}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card cursor-pointer hover:shadow-medium transition-shadow"
      onClick={() => setIsEditing(true)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{item.title}</h3>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {item.type === 'photo' && item.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        <p className="text-neutral-700 mb-4">{item.content}</p>

        <div className="space-y-2 text-sm text-neutral-600">
          {item.location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{item.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{format(new Date(item.date), 'PPP')}</span>
          </div>
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm bg-neutral-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-neutral-600">
          <div className="flex items-center gap-1">
            {item.permissions.public ? (
              <Globe size={16} />
            ) : (
              <Lock size={16} />
            )}
            <span>{item.permissions.public ? 'Public' : 'Private'}</span>
          </div>

          {item.permissions.allowComments && (
            <div className="flex items-center gap-1">
              <MessageSquare size={16} />
              <span>Comments enabled</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GalleryItem;