import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Camera, Edit3, Tag, X, Trash2 } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import useGalleryStore from '../stores/galleryStore';
import { useLocation } from 'react-router-dom';
import useNotificationStore from '../stores/notificationStore';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

const Gallery: React.FC = () => {
  const location = useLocation();
  const { items, addItem, updateItem, deleteItem, tags: availableTags } = useGalleryStore();
  const { addNotification } = useNotificationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemTitle: string;
  }>({
    isOpen: false,
    itemId: null,
    itemTitle: '',
  });
  const [newItem, setNewItem] = useState<Partial<GalleryItem>>({
    type: 'note',
    title: '',
    content: '',
    description: '',
    tags: location.state?.preselectedTags || [],
  });
  const [newTag, setNewTag] = useState('');

  const handleAddItem = () => {
    if (!newItem.title || (!newItem.content && !newItem.imageUrl)) return;

    const item: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'> = {
      type: newItem.type || 'note',
      title: newItem.title,
      content: newItem.content || '',
      description: newItem.description || '',
      date: new Date().toISOString().split('T')[0],
      imageUrl: newItem.imageUrl,
      imagePath: newItem.imagePath,
      tags: newItem.tags || [],
      permissions: {
        public: false,
        editable: true,
        allowComments: true,
      },
    };

    addItem(item);
    addNotification({
      title: 'Item Added',
      message: 'Your gallery item has been successfully added.',
      type: 'success'
    });
    setIsAddingItem(false);
    setNewItem({
      type: 'note',
      title: '',
      content: '',
      description: '',
      tags: [],
    });
  };

  const handleUpdateItem = () => {
    if (!editingItem || !editingItem.title || (!editingItem.content && !editingItem.imageUrl)) return;
    
    updateItem(editingItem.id, editingItem);
    addNotification({
      title: 'Item Updated',
      message: 'Your gallery item has been successfully updated.',
      type: 'success'
    });
    setEditingItem(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation();
    setDeleteDialog({
      isOpen: true,
      itemId: item.id,
      itemTitle: item.title,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.itemId) {
      deleteItem(deleteDialog.itemId);
      if (editingItem?.id === deleteDialog.itemId) {
        setEditingItem(null);
      }
      addNotification({
        title: 'Item Deleted',
        message: 'Your gallery item has been successfully deleted.',
        type: 'success'
      });
      setDeleteDialog({ isOpen: false, itemId: null, itemTitle: '' });
    }
  };

  const handleImageUpload = (file: File, croppedBlob?: Blob, uploadResult?: { url: string; path: string }) => {
    if (uploadResult) {
      // Image was uploaded to storage
      if (editingItem) {
        setEditingItem({
          ...editingItem,
          imageUrl: uploadResult.url,
          imagePath: uploadResult.path,
          type: 'photo'
        });
      } else {
        setNewItem({
          ...newItem,
          imageUrl: uploadResult.url,
          imagePath: uploadResult.path,
          type: 'photo'
        });
      }
    } else {
      // Fallback to blob URL (shouldn't happen with persistToStorage=true)
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingItem) {
          setEditingItem({
            ...editingItem,
            imageUrl: reader.result as string,
            type: 'photo'
          });
        } else {
          setNewItem({
            ...newItem,
            imageUrl: reader.result as string,
            type: 'photo'
          });
        }
      };
      reader.readAsDataURL(croppedBlob || file);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      const tag = newTag.trim().toLowerCase();
      if (editingItem) {
        setEditingItem({
          ...editingItem,
          tags: [...editingItem.tags, tag],
        });
      } else {
        setNewItem(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tag],
        }));
      }
      setNewTag('');
    }
  };

  const handleTagToggle = (tag: string) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        tags: editingItem.tags.includes(tag)
          ? editingItem.tags.filter(t => t !== tag)
          : [...editingItem.tags, tag],
      });
    } else {
      setNewItem(prev => {
        const currentTags = prev.tags || [];
        return {
          ...prev,
          tags: currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag],
        };
      });
    }
  };

  const filteredItems = items.filter(item => {
    if (selectedTag && !item.tags.includes(selectedTag)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(term) ||
        item.content.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const renderForm = (item: Partial<GalleryItem>, isEditing: boolean = false) => (
    <motion.div
      className="card mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{isEditing ? 'Edit Item' : 'Add New Item'}</h2>
        <button
          onClick={() => {
            setIsAddingItem(false);
            setEditingItem(null);
          }}
          className="text-neutral-500 hover:text-neutral-700"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            className={`flex-1 p-4 rounded-lg border-2 ${
              item.type === 'note'
                ? 'border-primary-400 bg-primary-50'
                : 'border-neutral-200'
            }`}
            onClick={() => {
              if (isEditing) {
                setEditingItem({ ...editingItem!, type: 'note' });
              } else {
                setNewItem({ ...newItem, type: 'note' });
              }
            }}
          >
            <Edit3 size={24} className="mx-auto mb-2" />
            <div className="text-center font-medium">Note</div>
          </button>

          <button
            className={`flex-1 p-4 rounded-lg border-2 ${
              item.type === 'photo'
                ? 'border-primary-400 bg-primary-50'
                : 'border-neutral-200'
            }`}
            onClick={() => {
              if (isEditing) {
                setEditingItem({ ...editingItem!, type: 'photo' });
              } else {
                setNewItem({ ...newItem, type: 'photo' });
              }
            }}
          >
            <Camera size={24} className="mx-auto mb-2" />
            <div className="text-center font-medium">Photo</div>
          </button>
        </div>

        <input
          type="text"
          placeholder="Title"
          className="input-field"
          value={item.title || ''}
          onChange={(e) => 
            isEditing 
              ? setEditingItem({ ...editingItem!, title: e.target.value })
              : setNewItem({ ...newItem, title: e.target.value })
          }
        />

        {item.type === 'photo' && (
          <ImageUpload
            onUpload={handleImageUpload}
            currentImageUrl={item.imageUrl}
            folder="gallery"
            persistToStorage={true}
            className="mt-4"
          />
        )}

        <textarea
          placeholder="Write your content here..."
          className="input-field"
          rows={4}
          value={item.content || ''}
          onChange={(e) =>
            isEditing
              ? setEditingItem({ ...editingItem!, content: e.target.value })
              : setNewItem({ ...newItem, content: e.target.value })
          }
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`
                  flex items-center px-3 py-1 rounded-full text-sm transition-colors
                  ${(item.tags || []).includes(tag)
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}
                `}
              >
                {tag}
                {(item.tags || []).includes(tag) && (
                  <X size={14} className="ml-1" />
                )}
              </button>
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
            onClick={() => {
              setIsAddingItem(false);
              setEditingItem(null);
            }}
            className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={isEditing ? handleUpdateItem : handleAddItem}
            disabled={!item.title || (!item.content && !item.imageUrl)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {isEditing ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gallery & Notes</h1>
        <p className="text-neutral-700">
          Document your onboarding journey with photos and notes. Images are automatically stored securely.
        </p>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
          />
          <input
            type="text"
            placeholder="Search..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="input-field px-3 py-2 sm:w-48 appearance-none cursor-pointer"
          value={selectedTag || ''}
          onChange={(e) => setSelectedTag(e.target.value || null)}
        >
          <option value="">All Tags</option>
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        <button
          className="btn-primary sm:w-auto"
          onClick={() => setIsAddingItem(true)}
        >
          <Plus size={20} className="mr-2" />
          Add Item
        </button>
      </div>

      <AnimatePresence>
        {isAddingItem && renderForm(newItem)}
        {editingItem && renderForm(editingItem, true)}
      </AnimatePresence>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteDialog.itemTitle}"? This action cannot be undone.`}
        onClose={() => setDeleteDialog({ isOpen: false, itemId: null, itemTitle: '' })}
        onConfirm={handleConfirmDelete}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            className="card cursor-pointer hover:shadow-medium transition-all group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setEditingItem(item)}
          >
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">{item.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleDeleteClick(e, item)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
              <div className="flex items-center justify-between text-sm text-neutral-500">
                <div>{new Date(item.date).toLocaleDateString()}</div>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="tag tag-small tag-neutral"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredItems.length === 0 && !isAddingItem && !editingItem && (
          <div className="col-span-2 text-center py-10">
            <p className="text-neutral-500">
              No items yet. Click the "Add Item" button to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;