import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Check, Mail, Copy, CheckSquare } from 'lucide-react';
import useTaskStore from '../stores/taskStore';
import useGalleryStore from '../stores/galleryStore';
import useMissionStore from '../stores/missionStore';
import { jsPDF } from 'jspdf';

interface ContentExportProps {}

const ContentExport: React.FC<ContentExportProps> = () => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'text' | 'email' | 'clipboard'>('pdf');
  const [includeContent, setIncludeContent] = useState({
    tasks: true,
    missions: true,
    people: true,
    notes: true,
    photos: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const { tasks } = useTaskStore();
  const { items: galleryItems } = useGalleryStore();
  const { missions } = useMissionStore();

  const handleSelectAll = () => {
    const allSelected = Object.values(includeContent).every(value => value);
    setIncludeContent({
      tasks: !allSelected,
      missions: !allSelected,
      people: !allSelected,
      notes: !allSelected,
      photos: !allSelected
    });
  };

  const generateContent = () => {
    let content = '';

    content += 'Onboarding Journey Summary\n';
    content += '=======================\n\n';

    if (includeContent.tasks) {
      content += 'Tasks\n-----\n\n';
      tasks.forEach(task => {
        content += `• ${task.title}\n`;
        content += `  Status: ${task.completed ? 'Completed' : 'Pending'}\n`;
        content += `  Due Date: ${task.dueDate}\n`;
        content += `  Category: ${task.category}\n`;
        if (task.description) content += `  Description: ${task.description}\n`;
        if (task.notes) content += `  Notes: ${task.notes}\n`;
        content += '\n';
      });
    }

    if (includeContent.missions) {
      content += 'Missions\n--------\n\n';
      missions.forEach(mission => {
        content += `• ${mission.title}\n`;
        content += `  Description: ${mission.description}\n`;
        content += `  Progress: ${Math.round(mission.progress)}%\n`;
        content += `  Status: ${mission.completed ? 'Completed' : 'In Progress'}\n`;
        content += `  Reward: ${mission.reward.value}\n`;
        content += '\n';
      });
    }

    if (includeContent.photos || includeContent.notes) {
      content += 'Gallery Items\n-------------\n\n';
      galleryItems.forEach(item => {
        if ((item.type === 'photo' && includeContent.photos) || 
            (item.type === 'note' && includeContent.notes)) {
          content += `• ${item.title}\n`;
          content += `  Type: ${item.type}\n`;
          content += `  Date: ${item.date}\n`;
          if (item.description) content += `  Description: ${item.description}\n`;
          if (item.location) content += `  Location: ${item.location}\n`;
          if (item.tags.length > 0) content += `  Tags: ${item.tags.join(', ')}\n`;
          content += '\n';
        }
      });
    }

    content += '\n---\n';
    content += 'Onboard Buddy - Made with love by Senza Pari in Colorado';

    return content;
  };

  const handleExport = async () => {
    setIsExporting(true);
    const content = generateContent();

    try {
      switch (exportFormat) {
        case 'pdf': {
          const doc = new jsPDF({
            unit: 'pt',
            format: 'a4',
            lineHeight: 1.5
          });

          // Set font and size
          doc.setFont('helvetica');
          doc.setFontSize(12);

          // Calculate line height in points
          const lineHeight = doc.getLineHeight();
          
          // Set margins
          const margin = 50;
          const pageWidth = doc.internal.pageSize.width - 2 * margin;
          
          // Split content into lines that fit the page width
          const lines = doc.splitTextToSize(content, pageWidth);
          
          let cursorY = margin;
          const pageHeight = doc.internal.pageSize.height;

          // Add lines to document with pagination
          lines.forEach(line => {
            // Check if we need a new page
            if (cursorY > pageHeight - margin) {
              doc.addPage();
              cursorY = margin;
            }

            // Add the line
            doc.text(line, margin, cursorY);
            cursorY += lineHeight;
          });

          doc.save('onboarding-journey.pdf');
          break;
        }

        case 'text': {
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'onboarding-journey.txt';
          link.click();
          URL.revokeObjectURL(url);
          break;
        }

        case 'email': {
          const subject = 'My Onboarding Journey';
          const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
          window.location.href = mailtoLink;
          break;
        }

        case 'clipboard': {
          await navigator.clipboard.writeText(content);
          break;
        }
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    { id: 'pdf', label: 'PDF Document', icon: <FileText size={24} /> },
    { id: 'text', label: 'Text File', icon: <FileText size={24} /> },
    { id: 'email', label: 'Send via Email', icon: <Mail size={24} /> },
    { id: 'clipboard', label: 'Copy to Clipboard', icon: <Copy size={24} /> },
  ];

  const contentOptions = [
    { id: 'tasks', label: 'Onboarding Tasks' },
    { id: 'missions', label: 'Missions & Progress' },
    { id: 'people', label: 'People & Meetings' },
    { id: 'notes', label: 'Notes & Learnings' },
    { id: 'photos', label: 'Photos & Media' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Export Content</h1>
        <p className="text-neutral-700">
          Export your onboarding journey as a shareable document.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.section 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold mb-4">Export Format</h2>
          <p className="text-neutral-600 mb-4">
            Choose how you'd like to export your onboarding journey.
          </p>
          
          <div className="space-y-3">
            {exportOptions.map((option) => (
              <label 
                key={option.id} 
                className={`
                  flex items-center p-4 rounded-lg cursor-pointer border-2 transition-all
                  ${exportFormat === option.id 
                    ? 'border-primary-400 bg-primary-50' 
                    : 'border-neutral-200 hover:border-primary-200'}
                `}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value={option.id}
                  checked={exportFormat === option.id}
                  onChange={() => setExportFormat(option.id as any)}
                  className="sr-only"
                />
                <div className="mr-4 text-primary-500">
                  {option.icon}
                </div>
                <div>
                  <div className="font-medium">{option.label}</div>
                </div>
                <div className="ml-auto">
                  {exportFormat === option.id && (
                    <div className="w-5 h-5 rounded-full bg-primary-400 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </motion.section>
        
        <motion.section 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Include Content</h2>
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <CheckSquare size={16} />
              {Object.values(includeContent).every(value => value) ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <p className="text-neutral-600 mb-4">
            Select what content you would like to include in your export.
          </p>
          
          <div className="space-y-3">
            {contentOptions.map((option) => (
              <label 
                key={option.id} 
                className={`
                  flex items-center p-4 rounded-lg cursor-pointer border-2 transition-all
                  ${includeContent[option.id as keyof typeof includeContent] 
                    ? 'border-primary-400 bg-primary-50' 
                    : 'border-neutral-200 hover:border-primary-200'}
                `}
              >
                <input
                  type="checkbox"
                  name={option.id}
                  checked={includeContent[option.id as keyof typeof includeContent]}
                  onChange={() => setIncludeContent(prev => ({
                    ...prev,
                    [option.id]: !prev[option.id as keyof typeof includeContent]
                  }))}
                  className="sr-only"
                />
                <div>
                  <div className="font-medium">{option.label}</div>
                </div>
                <div className="ml-auto">
                  {includeContent[option.id as keyof typeof includeContent] && (
                    <div className="w-5 h-5 rounded-full bg-primary-400 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </motion.section>
      </div>
      
      <motion.section 
        className="card mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h2 className="text-xl font-bold mb-4">Export Review</h2>
        <p className="text-neutral-600 mb-6">
          Please review the content that will be included in your export:
        </p>
        
        <div className="bg-neutral-50 rounded-lg p-5 mb-6">
          <div className="space-y-4">
            {includeContent.tasks && (
              <div>
                <h3 className="font-bold text-lg mb-1">Onboarding Tasks</h3>
                <p className="text-neutral-600 text-sm">All tasks including completion status and notes.</p>
              </div>
            )}
            
            {includeContent.missions && (
              <div>
                <h3 className="font-bold text-lg mb-1">Missions & Progress</h3>
                <p className="text-neutral-600 text-sm">Your mission progress, achievements, and rewards.</p>
              </div>
            )}
            
            {includeContent.people && (
              <div>
                <h3 className="font-bold text-lg mb-1">People & Meetings</h3>
                <p className="text-neutral-600 text-sm">Contact details, meeting notes and follow-ups.</p>
              </div>
            )}
            
            {includeContent.notes && (
              <div>
                <h3 className="font-bold text-lg mb-1">Notes & Learnings</h3>
                <p className="text-neutral-600 text-sm">All your notes, insights and key learnings.</p>
              </div>
            )}
            
            {includeContent.photos && (
              <div>
                <h3 className="font-bold text-lg mb-1">Photos & Media</h3>
                <p className="text-neutral-600 text-sm">Images and media content from your onboarding journey.</p>
              </div>
            )}
            
            {Object.values(includeContent).every(v => !v) && (
              <div className="text-neutral-500 italic">
                No content selected for export. Please select at least one content type.
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={handleExport}
            disabled={isExporting || Object.values(includeContent).every(v => !v)}
            className={`
              btn-primary
              ${(isExporting || Object.values(includeContent).every(v => !v)) && 'opacity-50 cursor-not-allowed'}
            `}
          >
            {isExporting ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                {exportFormat === 'clipboard' ? 'Copying...' : 'Generating Export...'}
              </>
            ) : exportSuccess ? (
              <>
                <Check size={20} className="mr-2" />
                {exportFormat === 'clipboard' ? 'Copied!' : 'Export Complete!'}
              </>
            ) : (
              <>
                {exportFormat === 'clipboard' ? (
                  <Copy size={20} className="mr-2" />
                ) : (
                  <Download size={20} className="mr-2" />
                )}
                {exportFormat === 'clipboard' ? 'Copy to Clipboard' : 'Export Now'}
              </>
            )}
          </button>
        </div>
      </motion.section>
    </div>
  );
};

export default ContentExport;