import { jsPDF } from 'jspdf';
import type { Task } from '../stores/taskStore';
import type { Mission } from '../stores/missionStore';
import type { GalleryItem } from '../stores/galleryStore';

// ── Color palette ──────────────────────────────────────────
const C = {
  primaryR: 57, primaryG: 224, primaryB: 121,       // #39e079
  darkR: 4, darkG: 120, darkB: 87,                  // #047857
  cardR: 248, cardG: 251, cardB: 250,                // #f8fbfa
  bodyR: 77, bodyG: 124, bodyB: 95,                  // #4d7c5f
  headR: 14, headG: 26, headB: 19,                   // #0e1a13
  white: 255,
  priorityHigh: [239, 68, 68] as const,              // #ef4444
  priorityMed: [245, 158, 11] as const,              // #f59e0b
  priorityLow: [16, 185, 129] as const,              // #10b981
};

const MARGIN = 40;
const PAGE_W = 595.28; // A4 pt
const PAGE_H = 841.89;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const FOOTER_Y = PAGE_H - 30;

let pageNum = 0;

// ── Helpers ────────────────────────────────────────────────

function drawPageFooter(doc: jsPDF) {
  pageNum++;
  // thin accent line at top (non-cover pages)
  if (pageNum > 1) {
    doc.setDrawColor(C.primaryR, C.primaryG, C.primaryB);
    doc.setLineWidth(2);
    doc.line(0, 0, PAGE_W, 0);
  }
  // page number
  doc.setFontSize(9);
  doc.setTextColor(C.bodyR, C.bodyG, C.bodyB);
  doc.text(`${pageNum}`, PAGE_W - MARGIN, FOOTER_Y, { align: 'right' });
  // branding
  doc.setFontSize(7);
  doc.text('Onboard Buddy — Made with love by Senza Pari in Colorado', PAGE_W / 2, FOOTER_Y, { align: 'center' });
}

function newPage(doc: jsPDF): number {
  doc.addPage();
  drawPageFooter(doc);
  return MARGIN + 20; // return starting cursorY
}

function ensureSpace(doc: jsPDF, needed: number, cursorY: number): number {
  if (cursorY + needed > FOOTER_Y - 20) {
    return newPage(doc);
  }
  return cursorY;
}

function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, style: 'F' | 'S' | 'FD' = 'F') {
  doc.roundedRect(x, y, w, h, r, r, style);
}

function drawSectionHeader(doc: jsPDF, title: string, cursorY: number): number {
  cursorY = ensureSpace(doc, 50, cursorY);
  // Banner
  doc.setFillColor(C.darkR, C.darkG, C.darkB);
  drawRoundedRect(doc, MARGIN, cursorY, CONTENT_W, 36, 6);
  // Title text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(C.white, C.white, C.white);
  doc.text(title, MARGIN + 16, cursorY + 23);
  return cursorY + 50;
}

function drawBadge(doc: jsPDF, text: string, x: number, y: number, r: number, g: number, b: number): number {
  const textW = doc.getTextWidth(text);
  const padX = 8;
  const badgeW = textW + padX * 2;
  const badgeH = 16;
  doc.setFillColor(r, g, b);
  drawRoundedRect(doc, x, y, badgeW, badgeH, 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(C.white, C.white, C.white);
  doc.text(text, x + padX, y + 11);
  return badgeW;
}

// ── Cover Page ─────────────────────────────────────────────

function drawCoverPage(doc: jsPDF) {
  pageNum = 0;
  // Simulated gradient — vertical strips transitioning from primaryGreen to darkGreen
  const steps = 200;
  const stripH = PAGE_H / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const r = Math.round(C.primaryR + (C.darkR - C.primaryR) * t);
    const g = Math.round(C.primaryG + (C.darkG - C.primaryG) * t);
    const b = Math.round(C.primaryB + (C.darkB - C.primaryB) * t);
    doc.setFillColor(r, g, b);
    doc.rect(0, i * stripH, PAGE_W, stripH + 1, 'F');
  }

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(C.white, C.white, C.white);
  doc.text('Onboarding Journey', PAGE_W / 2, PAGE_H / 2 - 30, { align: 'center' });
  doc.text('Summary', PAGE_W / 2, PAGE_H / 2 + 15, { align: 'center' });

  // Date subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(220, 255, 235);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(dateStr, PAGE_W / 2, PAGE_H / 2 + 50, { align: 'center' });

  // Branding at bottom
  doc.setFontSize(11);
  doc.setTextColor(200, 255, 220);
  doc.text('Onboard Buddy', PAGE_W / 2, PAGE_H - 60, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Made with love by Senza Pari in Colorado', PAGE_W / 2, PAGE_H - 44, { align: 'center' });
}

// ── Task Card ──────────────────────────────────────────────

function drawTaskCard(doc: jsPDF, task: Task, cursorY: number): number {
  const cardH = 62;
  cursorY = ensureSpace(doc, cardH + 10, cursorY);

  // Card background
  doc.setFillColor(C.cardR, C.cardG, C.cardB);
  drawRoundedRect(doc, MARGIN, cursorY, CONTENT_W, cardH, 6);

  // Status circle
  const circleX = MARGIN + 20;
  const circleY = cursorY + 20;
  if (task.completed) {
    doc.setFillColor(C.primaryR, C.primaryG, C.primaryB);
    doc.circle(circleX, circleY, 7, 'F');
    // Checkmark (simple V shape)
    doc.setDrawColor(C.white, C.white, C.white);
    doc.setLineWidth(1.5);
    doc.line(circleX - 3, circleY, circleX - 0.5, circleY + 3);
    doc.line(circleX - 0.5, circleY + 3, circleX + 4, circleY - 3);
  } else {
    doc.setDrawColor(C.bodyR, C.bodyG, C.bodyB);
    doc.setLineWidth(1);
    doc.circle(circleX, circleY, 7, 'S');
  }

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(C.headR, C.headG, C.headB);
  doc.text(task.title, MARGIN + 38, cursorY + 18);

  // Priority dot
  const pColor = task.priority === 'high' ? C.priorityHigh : task.priority === 'medium' ? C.priorityMed : C.priorityLow;
  doc.setFillColor(pColor[0], pColor[1], pColor[2]);
  doc.circle(MARGIN + 38, cursorY + 32, 4, 'F');

  // Priority label
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(C.bodyR, C.bodyG, C.bodyB);
  doc.text(task.priority.charAt(0).toUpperCase() + task.priority.slice(1), MARGIN + 46, cursorY + 35);

  // Department badge
  const deptColors: Record<string, [number, number, number]> = {
    HR: [236, 72, 153],    // pink
    IT: [59, 130, 246],     // blue
    Manager: [139, 92, 246] // purple
  };
  const dc = deptColors[task.department] || [C.bodyR, C.bodyG, C.bodyB];
  drawBadge(doc, task.department, MARGIN + 90, cursorY + 26, dc[0], dc[1], dc[2]);

  // Due date
  if (task.dueDate) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(C.bodyR, C.bodyG, C.bodyB);
    doc.text(`Due: ${task.dueDate}`, MARGIN + CONTENT_W - 10, cursorY + 18, { align: 'right' });
  }

  // Description (truncated)
  if (task.description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(C.bodyR, C.bodyG, C.bodyB);
    const desc = task.description.length > 80 ? task.description.substring(0, 80) + '…' : task.description;
    doc.text(desc, MARGIN + 38, cursorY + 50);
  }

  return cursorY + cardH + 8;
}

// ── Mission Card ───────────────────────────────────────────

function drawMissionCard(doc: jsPDF, mission: Mission, cursorY: number): number {
  const cardH = 75;
  cursorY = ensureSpace(doc, cardH + 10, cursorY);

  // Card background
  doc.setFillColor(C.cardR, C.cardG, C.cardB);
  drawRoundedRect(doc, MARGIN, cursorY, CONTENT_W, cardH, 6);

  // Status indicator
  const circleX = MARGIN + 20;
  const circleY = cursorY + 20;
  if (mission.completed) {
    doc.setFillColor(C.primaryR, C.primaryG, C.primaryB);
    doc.circle(circleX, circleY, 7, 'F');
    doc.setDrawColor(C.white, C.white, C.white);
    doc.setLineWidth(1.5);
    doc.line(circleX - 3, circleY, circleX - 0.5, circleY + 3);
    doc.line(circleX - 0.5, circleY + 3, circleX + 4, circleY - 3);
  } else {
    doc.setDrawColor(C.bodyR, C.bodyG, C.bodyB);
    doc.setLineWidth(1);
    doc.circle(circleX, circleY, 7, 'S');
  }

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(C.headR, C.headG, C.headB);
  doc.text(mission.title, MARGIN + 38, cursorY + 18);

  // Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(C.bodyR, C.bodyG, C.bodyB);
  const desc = mission.description.length > 90 ? mission.description.substring(0, 90) + '…' : mission.description;
  doc.text(desc, MARGIN + 38, cursorY + 32);

  // Progress bar
  const barX = MARGIN + 38;
  const barY = cursorY + 42;
  const barW = CONTENT_W - 100;
  const barH = 10;
  // Background bar
  doc.setFillColor(220, 220, 220);
  drawRoundedRect(doc, barX, barY, barW, barH, 3);
  // Filled bar
  const fillW = Math.max(0, (mission.progress / 100) * barW);
  if (fillW > 0) {
    doc.setFillColor(C.primaryR, C.primaryG, C.primaryB);
    drawRoundedRect(doc, barX, barY, fillW, barH, 3);
  }
  // Percentage text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(C.headR, C.headG, C.headB);
  doc.text(`${Math.round(mission.progress)}%`, barX + barW + 8, barY + 8);

  // Reward badge
  const rewardText = `★ ${mission.reward.value}`;
  drawBadge(doc, rewardText, MARGIN + 38, cursorY + 58, C.darkR, C.darkG, C.darkB);

  return cursorY + cardH + 8;
}

// ── Gallery Card ───────────────────────────────────────────

function drawGalleryCard(doc: jsPDF, item: GalleryItem, cursorY: number): number {
  const cardH = 52;
  cursorY = ensureSpace(doc, cardH + 10, cursorY);

  // Card background
  doc.setFillColor(C.cardR, C.cardG, C.cardB);
  drawRoundedRect(doc, MARGIN, cursorY, CONTENT_W, cardH, 6);

  // Type badge
  const isPhoto = item.type === 'photo';
  drawBadge(doc, isPhoto ? 'Photo' : 'Note', MARGIN + 14, cursorY + 10, isPhoto ? 59 : 139, isPhoto ? 130 : 92, isPhoto ? 246 : 246);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(C.headR, C.headG, C.headB);
  doc.text(item.title, MARGIN + 80, cursorY + 22);

  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(C.bodyR, C.bodyG, C.bodyB);
  doc.text(item.date, MARGIN + CONTENT_W - 10, cursorY + 22, { align: 'right' });

  // Description / location
  let infoText = '';
  if (item.description) infoText = item.description.length > 70 ? item.description.substring(0, 70) + '…' : item.description;
  if (item.location) infoText += (infoText ? '  •  ' : '') + item.location;
  if (infoText) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(C.bodyR, C.bodyG, C.bodyB);
    doc.text(infoText, MARGIN + 14, cursorY + 38);
  }

  // Tags as pills
  let tagX = MARGIN + 14;
  if (item.tags.length > 0) {
    doc.setFontSize(7);
    item.tags.slice(0, 4).forEach(tag => {
      if (tagX + 50 > MARGIN + CONTENT_W) return;
      const tw = drawBadge(doc, tag, tagX, cursorY + cardH - 16, C.primaryR, C.primaryG, C.primaryB);
      tagX += tw + 4;
    });
  }

  return cursorY + cardH + 8;
}

// ── Main Export Function ───────────────────────────────────

interface ExportContent {
  tasks: boolean;
  missions: boolean;
  people: boolean;
  notes: boolean;
  photos: boolean;
}

export function generateStyledPDF(
  tasks: Task[],
  missions: Mission[],
  galleryItems: GalleryItem[],
  includeContent: ExportContent
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  pageNum = 0;

  // ── Cover page ──
  drawCoverPage(doc);

  // ── Tasks section ──
  if (includeContent.tasks && tasks.length > 0) {
    let y = newPage(doc);
    y = drawSectionHeader(doc, 'Onboarding Tasks', y);
    tasks.forEach(task => {
      y = drawTaskCard(doc, task, y);
    });
  }

  // ── Missions section ──
  if (includeContent.missions && missions.length > 0) {
    let y = newPage(doc);
    y = drawSectionHeader(doc, 'Missions & Progress', y);
    missions.forEach(mission => {
      y = drawMissionCard(doc, mission, y);
    });
  }

  // ── Gallery / Notes section ──
  const filteredGallery = galleryItems.filter(item =>
    (item.type === 'photo' && includeContent.photos) ||
    (item.type === 'note' && includeContent.notes)
  );
  if (filteredGallery.length > 0) {
    let y = newPage(doc);
    y = drawSectionHeader(doc, 'Gallery & Notes', y);
    filteredGallery.forEach(item => {
      y = drawGalleryCard(doc, item, y);
    });
  }

  doc.save('onboarding-journey.pdf');
}
