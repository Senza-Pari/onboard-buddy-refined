import useTaskStore from '../stores/taskStore';
import useMissionStore from '../stores/missionStore';
import usePeopleStore from '../stores/peopleStore';
import useGalleryStore from '../stores/galleryStore';

export function useBuddyContext(): string {
  const tasks = useTaskStore((s) => s.tasks);
  const missions = useMissionStore((s) => s.missions);
  const people = usePeopleStore((s) => s.people);
  const items = useGalleryStore((s) => s.items);

  const taskLines = tasks.map(
    (t) =>
      `- [${t.completed ? 'x' : ' '}] ${t.title} (${t.department}, ${t.priority} priority)`
  );

  const missionLines = missions.map(
    (m) =>
      `- ${m.title}: ${Math.round(m.progress)}% complete${m.completed ? ' ✅' : ''}`
  );

  const peopleLines = people.map(
    (p) =>
      `- ${p.name}, ${p.role} (${p.department})${p.meetingDate ? `, meeting: ${p.meetingDate}` : ''}`
  );

  const recentJournal = [...items]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)
    .map((i) => `- ${i.title} (${new Date(i.createdAt).toLocaleDateString()})`);

  return [
    `TASKS (${tasks.filter((t) => t.completed).length}/${tasks.length} done):`,
    ...taskLines,
    '',
    `MISSIONS (${missions.filter((m) => m.completed).length}/${missions.length} done):`,
    ...missionLines,
    '',
    `PEOPLE (${people.length} contacts):`,
    ...peopleLines,
    '',
    `JOURNAL (${items.length} entries, last 5):`,
    ...recentJournal,
  ].join('\n');
}
