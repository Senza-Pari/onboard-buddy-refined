import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Calendar, Tag, Trophy, User, MapPin, Link2, CheckCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '../stores/taskStore';
import type { Mission } from '../stores/missionStore';
import type { GalleryItem } from '../stores/galleryStore';

interface ItemViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  item: Task | Mission | GalleryItem | PersonProfile | null;
  itemType: 'task' | 'mission' | 'gallery' | 'person';
  canEdit?: boolean;
}

interface PersonProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  description: string;
  meetingDate?: string;
  meetingTime?: string;
  topics?: string[];
  priority: 'high' | 'medium' | 'low';
  photoUrl?: string;
}

const ItemViewModal: React.FC<ItemViewModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  item,
  itemType,
  canEdit = true,
}) => {
  if (!isOpen || !item) return null;

  const renderTaskView = (task: Task) => (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {task.completed ? (
            <CheckCircle size={24} className="text-green-500" />
          ) : (
            <Circle size={24} className="text-neutral-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2">{task.title}</h3>
          <p className="text-neutral-600 mb-4">{task.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-neutral-500" />
            <span className="text-sm">
              <strong>Due:</strong> {format(new Date(task.dueDate), 'PPP')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.priority === 'high' ? 'bg-red-100 text-red-700' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {task.priority} priority
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-sm">
            <strong>Department:</strong> {task.department}
          </div>
          <div className="text-sm">
            <strong>Status:</strong> {task.completed ? 'Completed' : 'Pending'}
          </div>
        </div>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {task.notes && (
        <div>
          <h4 className="font-medium mb-2">Notes</h4>
          <div className="bg-neutral-50 p-3 rounded-lg">
            <p className="text-sm text-neutral-700">{task.notes}</p>
          </div>
        </div>
      )}

      {task.link && (
        <div>
          <h4 className="font-medium mb-2">Resource Link</h4>
          <a
            href={task.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <Link2 size={16} />
            Open Resource
          </a>
        </div>
      )}
    </div>
  );

  const renderMissionView = (mission: Mission) => (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-indigo-100">
          <Trophy size={24} className="text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2">{mission.title}</h3>
          <p className="text-neutral-600 mb-4">{mission.description}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Progress</span>
          <span>{Math.round(mission.progress)}%</span>
        </div>
        <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${mission.progress}%` }}
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Requirements</h4>
        <div className="space-y-2">
          {mission.requirements.map((req, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-neutral-500" />
                <span className="font-medium">{req.tag}</span>
              </div>
              <span className="text-sm text-neutral-600">
                {req.current} / {req.count} items
              </span>
            </div>
          ))}
        </div>
      </div>

      {mission.deadline && (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-neutral-500" />
          <span className="text-sm">
            <strong>Deadline:</strong> {format(new Date(mission.deadline), 'PPP')}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Trophy size={16} className="text-yellow-500" />
        <span className="font-medium">
          Reward: {typeof mission.reward.value === 'number' 
            ? `${mission.reward.value} points` 
            : mission.reward.value}
        </span>
      </div>

      {mission.link && (
        <div>
          <a
            href={mission.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <Link2 size={16} />
            View Resource
          </a>
        </div>
      )}
    </div>
  );

  const renderGalleryView = (galleryItem: GalleryItem) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">{galleryItem.title}</h3>
        {galleryItem.description && (
          <p className="text-neutral-600 mb-4">{galleryItem.description}</p>
        )}
      </div>

      {galleryItem.type === 'photo' && galleryItem.imageUrl && (
        <div className="rounded-lg overflow-hidden">
          <img
            src={galleryItem.imageUrl}
            alt={galleryItem.altText || galleryItem.title}
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      <div className="bg-neutral-50 p-4 rounded-lg">
        <p className="text-neutral-700">{galleryItem.content}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-neutral-500" />
          <span>{format(new Date(galleryItem.date), 'PPP')}</span>
        </div>
        {galleryItem.location && (
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-neutral-500" />
            <span>{galleryItem.location}</span>
          </div>
        )}
      </div>

      {galleryItem.tags.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {galleryItem.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPersonView = (person: PersonProfile) => (
    <div className="space-y-6">
      <div className="flex gap-6">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0">
          {person.photoUrl ? (
            <img 
              src={person.photoUrl} 
              alt={person.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={32} className="text-neutral-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-1">{person.name}</h3>
          <p className="text-lg text-neutral-700 mb-1">{person.role}</p>
          <p className="text-neutral-600">{person.department}</p>
          <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
            person.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {person.priority} priority
          </span>
        </div>
      </div>

      <div className="bg-neutral-50 p-4 rounded-lg">
        <p className="text-neutral-700">{person.description}</p>
      </div>

      {(person.meetingDate || person.meetingTime) && (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-neutral-500" />
          <span className="text-sm">
            <strong>Meeting:</strong> {person.meetingDate} {person.meetingTime && `at ${person.meetingTime}`}
          </span>
        </div>
      )}

      {person.topics && person.topics.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Discussion Topics</h4>
          <div className="flex flex-wrap gap-2">
            {person.topics.map((topic, index) => (
              <span key={index} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (itemType) {
      case 'task':
        return renderTaskView(item as Task);
      case 'mission':
        return renderMissionView(item as Mission);
      case 'gallery':
        return renderGalleryView(item as GalleryItem);
      case 'person':
        return renderPersonView(item as PersonProfile);
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold capitalize">{itemType} Details</h2>
              <div className="flex items-center gap-2">
                {canEdit && onEdit && (
                  <button
                    onClick={onEdit}
                    className="p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-full"
                  >
                    <Edit size={18} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {renderContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ItemViewModal;