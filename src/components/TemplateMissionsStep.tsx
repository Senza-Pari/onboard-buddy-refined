import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Target } from 'lucide-react';
import useTemplateStore, { type TemplateMission } from '../stores/templateStore';
import TemplateMissionForm from './TemplateMissionForm';

interface TemplateMissionsStepProps {
  templateId: string;
}

const TemplateMissionsStep: React.FC<TemplateMissionsStepProps> = ({ templateId }) => {
  const { getTemplate, addMission, updateMission, deleteMission } = useTemplateStore();
  const template = getTemplate(templateId);
  const [showForm, setShowForm] = useState(false);
  const [editingMission, setEditingMission] = useState<TemplateMission | null>(null);

  if (!template) return null;

  const handleAdd = (mission: Omit<TemplateMission, 'id'>) => {
    addMission(templateId, mission);
    setShowForm(false);
  };

  const handleUpdate = (mission: Omit<TemplateMission, 'id'>) => {
    if (!editingMission) return;
    updateMission(templateId, editingMission.id, mission);
    setEditingMission(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Missions</h2>
          <p className="text-muted-foreground">
            Missions are goals driven by journal entries. When a new hire adds tagged entries, missions progress automatically.
          </p>
        </div>
        {!showForm && !editingMission && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={18} />
            Add Mission
          </button>
        )}
      </div>

      {showForm && (
        <TemplateMissionForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {editingMission && (
        <TemplateMissionForm
          onSubmit={handleUpdate}
          onCancel={() => setEditingMission(null)}
          initialValues={editingMission}
        />
      )}

      {template.missions.length > 0 ? (
        <div className="space-y-3">
          {template.missions.map((mission) => (
            <div
              key={mission.id}
              className="flex items-start justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/20 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground mb-1">{mission.title}</h4>
                {mission.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{mission.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {mission.requirements.map((req, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
                      {req.tag} × {req.count}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  Reward: <span className="font-medium text-foreground">{mission.reward.type === 'points' ? `${mission.reward.value} pts` : String(mission.reward.value)}</span>
                  <span className="ml-1 text-muted-foreground">({mission.reward.type})</span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={() => setEditingMission(mission)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteMission(templateId, mission.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
          <Target size={40} className="mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-1">No missions yet</h3>
          <p className="text-muted-foreground mb-4 text-sm">Missions help track progress through tagged journal entries.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Add Your First Mission
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateMissionsStep;
