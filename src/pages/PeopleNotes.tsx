import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, User, Calendar, Edit, Trash2, X } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

// Sample data
const initialPeople = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Team Lead',
    department: 'Engineering',
    meetingDate: '2025-04-14',
    meetingTime: '10:00 AM',
    topics: ['Team structure', 'Current projects', 'Expectations'],
    notes: 'Sarah has been with the company for 5 years. She oversees three project teams and will be my direct manager.',
    followUp: 'Schedule a follow-up meeting to go over my first week progress.',
    photoUrl: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Product Manager',
    department: 'Product',
    meetingDate: '2025-04-16',
    meetingTime: '2:00 PM',
    topics: ['Product roadmap', 'User research', 'Upcoming releases'],
    notes: 'Michael leads the product strategy for our core platform. He works closely with engineering and design teams.',
    followUp: 'Review product documentation before our meeting.',
    photoUrl: 'https://images.pexels.com/photos/874158/pexels-photo-874158.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    department: 'Design',
    meetingDate: '2025-04-18',
    meetingTime: '11:30 AM',
    topics: ['Design system', 'User flows', 'Collaboration processes'],
    notes: '',
    followUp: '',
    photoUrl: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
];

// Person type definition
interface Person {
  id: number;
  name: string;
  role: string;
  department: string;
  meetingDate: string;
  meetingTime: string;
  topics: string[];
  notes: string;
  followUp: string;
  photoUrl: string;
}

const PeopleNotes: React.FC = () => {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>(initialPeople);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<number | null>(null);
  const [viewingPersonId, setViewingPersonId] = useState<number | null>(null);
  const [newTopic, setNewTopic] = useState('');
  
  const [formData, setFormData] = useState<Omit<Person, 'id'>>({
    name: '',
    role: '',
    department: '',
    meetingDate: '',
    meetingTime: '',
    topics: [],
    notes: '',
    followUp: '',
    photoUrl: '',
  });

  const departments = Array.from(new Set(people.map(person => person.department)));

  // Filter people based on search and department
  const filterPeople = () => {
    let filtered = people;
    
    if (selectedDepartment) {
      filtered = filtered.filter(person => person.department === selectedDepartment);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        person => 
          person.name.toLowerCase().includes(term) || 
          person.role.toLowerCase().includes(term) ||
          person.department.toLowerCase().includes(term)
      );
    }
    
    setFilteredPeople(filtered);
  };

  // Update filters when they change
  React.useEffect(() => {
    filterPeople();
  }, [people, selectedDepartment, searchTerm]);

  // Initialize form for editing
  const startEditing = (id: number) => {
    const personToEdit = people.find(person => person.id === id);
    if (personToEdit) {
      const { id: _, ...rest } = personToEdit;
      setFormData(rest);
      setEditingPersonId(id);
      setIsAddingPerson(false);
    }
  };

  // Start viewing a person's details
  const viewPerson = (id: number) => {
    setViewingPersonId(id);
  };

  // Handle form change
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add a topic to the list
  const addTopic = () => {
    if (newTopic.trim()) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, newTopic.trim()]
      }));
      setNewTopic('');
    }
  };

  // Remove a topic from the list
  const removeTopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  // Submit the form (add or edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPersonId !== null) {
      // Update existing person
      setPeople(people.map(person => 
        person.id === editingPersonId ? { ...person, ...formData } : person
      ));
      setEditingPersonId(null);
    } else {
      // Add new person
      const newPerson: Person = {
        ...formData,
        id: people.length > 0 ? Math.max(...people.map(p => p.id)) + 1 : 1,
      };
      setPeople([...people, newPerson]);
    }
    
    // Reset form
    setFormData({
      name: '',
      role: '',
      department: '',
      meetingDate: '',
      meetingTime: '',
      topics: [],
      notes: '',
      followUp: '',
      photoUrl: '',
    });
    setIsAddingPerson(false);
  };

  // Cancel form
  const cancelForm = () => {
    setFormData({
      name: '',
      role: '',
      department: '',
      meetingDate: '',
      meetingTime: '',
      topics: [],
      notes: '',
      followUp: '',
      photoUrl: '',
    });
    setIsAddingPerson(false);
    setEditingPersonId(null);
  };

  // Delete a person
  const deletePerson = (id: number) => {
    setPeople(people.filter(person => person.id !== id));
    if (viewingPersonId === id) {
      setViewingPersonId(null);
    }
  };

  // Render the form (for add or edit)
  const renderForm = () => (
    <motion.div 
      className="card mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-lg font-bold mb-4">
        {editingPersonId !== null ? 'Edit Contact' : 'Add New Contact'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="input-field"
              placeholder="Full name"
              value={formData.name}
              onChange={handleFormChange}
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-neutral-700 mb-1">
              Role
            </label>
            <input
              id="role"
              name="role"
              type="text"
              required
              className="input-field"
              placeholder="Job title"
              value={formData.role}
              onChange={handleFormChange}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-neutral-700 mb-1">
              Department
            </label>
            <input
              id="department"
              name="department"
              type="text"
              required
              className="input-field"
              placeholder="Department"
              value={formData.department}
              onChange={handleFormChange}
            />
          </div>
          
          <div>
            <label htmlFor="photoUrl" className="block text-sm font-medium text-neutral-700 mb-1">
              Profile Photo
            </label>
            <ImageUpload
              onUpload={(file, croppedBlob) => {
                // In a real app, you would upload to a server
                // For demo, we'll use object URL
                const url = URL.createObjectURL(croppedBlob || file);
                setFormData(prev => ({ ...prev, photoUrl: url }));
              }}
              aspectRatio={1} // Square aspect ratio for profile photos
              enableCropping
              className="mb-4"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="meetingDate" className="block text-sm font-medium text-neutral-700 mb-1">
              Meeting Date
            </label>
            <input
              id="meetingDate"
              name="meetingDate"
              type="date"
              className="input-field"
              value={formData.meetingDate}
              onChange={handleFormChange}
            />
          </div>
          
          <div>
            <label htmlFor="meetingTime" className="block text-sm font-medium text-neutral-700 mb-1">
              Meeting Time
            </label>
            <input
              id="meetingTime"
              name="meetingTime"
              type="time"
              className="input-field"
              value={formData.meetingTime}
              onChange={handleFormChange}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Discussion Topics
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.topics.map((topic, index) => (
              <div 
                key={index} 
                className="tag tag-neutral"
              >
                <span className="text-sm">{topic}</span>
                <button 
                  type="button" 
                  onClick={() => removeTopic(index)}
                  className="ml-2 text-neutral-500 hover:text-neutral-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add a topic"
              className="input-field rounded-r-none flex-1"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
            />
            <button
              type="button"
              onClick={addTopic}
              className="px-4 bg-neutral-200 hover:bg-neutral-300 rounded-r-lg"
            >
              Add
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="input-field"
            placeholder="Add any notes about this person..."
            value={formData.notes}
            onChange={handleFormChange}
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="followUp" className="block text-sm font-medium text-neutral-700 mb-1">
            Follow-up Actions
          </label>
          <textarea
            id="followUp"
            name="followUp"
            rows={2}
            className="input-field"
            placeholder="Add any follow-up items..."
            value={formData.followUp}
            onChange={handleFormChange}
          ></textarea>
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button" 
            onClick={cancelForm}
            className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
          >
            {editingPersonId !== null ? 'Update Contact' : 'Add Contact'}
          </button>
        </div>
      </form>
    </motion.div>
  );

  // Render the person detail view
  const renderPersonDetail = () => {
    const person = people.find(p => p.id === viewingPersonId);
    
    if (!person) return null;
    
    return (
      <motion.div 
        className="card mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-bold">Contact Details</h3>
          <button 
            onClick={() => setViewingPersonId(null)}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <div className="rounded-lg overflow-hidden bg-neutral-200 aspect-square">
              {person.photoUrl ? (
                <img 
                  src={person.photoUrl} 
                  alt={person.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                  <User size={64} className="text-neutral-400" />
                </div>
              )}
            </div>
            
            <div className="mt-4 space-y-2">
              <h4 className="font-bold text-xl">{person.name}</h4>
              <p className="text-neutral-700">{person.role}</p>
              <p className="text-neutral-600">{person.department}</p>
              
              {(person.meetingDate || person.meetingTime) && (
                <div className="flex items-center text-neutral-600 mt-2">
                  <Calendar size={16} className="mr-2" />
                  <span>
                    {person.meetingDate && person.meetingDate} 
                    {person.meetingTime && ` at ${person.meetingTime}`}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => startEditing(person.id)}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              >
                <Edit size={16} />
                Edit
              </button>
              
              <button 
                onClick={() => deletePerson(person.id)}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            {person.topics.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Discussion Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {person.topics.map((topic, index) => (
                    <span 
                      key={index} 
                      className="tag tag-neutral"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {person.notes && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-neutral-700 bg-neutral-50 p-3 rounded-lg">
                  {person.notes}
                </p>
              </div>
            )}
            
            {person.followUp && (
              <div>
                <h4 className="font-medium mb-2">Follow-up Actions</h4>
                <p className="text-neutral-700 bg-neutral-50 p-3 rounded-lg">
                  {person.followUp}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">People & Notes</h1>
        <p className="text-neutral-700">
          Keep track of important colleagues and your meetings with them.
        </p>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
          <input 
            type="text"
            placeholder="Search people..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="input-field px-3 py-2 sm:w-48 appearance-none cursor-pointer"
          value={selectedDepartment || ''}
          onChange={(e) => setSelectedDepartment(e.target.value || null)}
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {!isAddingPerson && editingPersonId === null && viewingPersonId === null && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <button 
            className="btn-primary flex items-center justify-center gap-2 max-w-xs"
            onClick={() => setIsAddingPerson(true)}
          >
            <Plus size={20} />
            Add New Contact
          </button>
        </motion.div>
      )}

      {/* Form for adding/editing a person */}
      {(isAddingPerson || editingPersonId !== null) && renderForm()}
      
      {/* Detail view for a person */}
      {viewingPersonId !== null && renderPersonDetail()}

      {/* List of people */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPeople.map((person) => (
          <motion.div 
            key={person.id}
            className="card cursor-pointer hover:shadow-medium transition-shadow"
            onClick={() => viewPerson(person.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-neutral-200">
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
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{person.name}</h3>
                <p className="text-sm text-neutral-600">{person.role}</p>
                <p className="text-sm text-neutral-500">{person.department}</p>
                
                {(person.meetingDate || person.meetingTime) && (
                  <div className="flex items-center text-sm text-neutral-600 mt-1">
                    <Calendar size={14} className="mr-1" />
                    <span>
                      {person.meetingDate && person.meetingDate} 
                      {person.meetingTime && ` at ${person.meetingTime}`}
                    </span>
                  </div>
                )}
                
                {person.topics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {person.topics.slice(0, 2).map((topic, index) => (
                      <span 
                        key={index} 
                        className="tag tag-neutral tag-small"
                      >
                        {topic}
                      </span>
                    ))}
                    {person.topics.length > 2 && (
                      <span className="tag tag-neutral tag-small">
                        +{person.topics.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredPeople.length === 0 && (
          <div className="col-span-2 text-center py-10">
            <p className="text-neutral-500">No contacts match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeopleNotes;