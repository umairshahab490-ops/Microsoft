import { marked } from 'marked';
import { Note } from '../types';

// ── Markdown ─────────────────────────────────────────────────
marked.setOptions({ breaks: true, gfm: true });

export function renderMarkdown(content: string): string {
  if (!content) return '<p class="text-gray-400 italic">Start writing...</p>';
  return marked.parse(content) as string;
}

// ── Date formatting ──────────────────────────────────────────
export function formatDate(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: days > 365 ? 'numeric' : undefined });
}

// formatFullDate used in note info
export function formatFullDate(ts: number): string {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Stats ────────────────────────────────────────────────────
export function getStats(content: string) {
  const chars = content.length;
  const charsNoSpace = content.replace(/\s/g, '').length;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lines = content.split('\n').length;
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim()).length;
  const readTime = Math.max(1, Math.ceil(words / 200));
  return { chars, charsNoSpace, words, lines, paragraphs, readTime };
}

// ── Markdown insertion ───────────────────────────────────────
export function insertMarkdownSyntax(
  content: string,
  start: number,
  end: number,
  syntax: string
): { newContent: string; cursorPos: number } {
  const selected = content.substring(start, end);
  let insertion = '';
  let cursorOffset = 0;

  switch (syntax) {
    case 'bold':
      insertion = `**${selected || 'bold text'}**`;
      cursorOffset = selected ? insertion.length : 2;
      break;
    case 'italic':
      insertion = `*${selected || 'italic text'}*`;
      cursorOffset = selected ? insertion.length : 1;
      break;
    case 'strikethrough':
      insertion = `~~${selected || 'strikethrough'}~~`;
      cursorOffset = selected ? insertion.length : 2;
      break;
    case 'h1':
      insertion = `\n# ${selected || 'Heading 1'}\n`;
      cursorOffset = insertion.length;
      break;
    case 'h2':
      insertion = `\n## ${selected || 'Heading 2'}\n`;
      cursorOffset = insertion.length;
      break;
    case 'h3':
      insertion = `\n### ${selected || 'Heading 3'}\n`;
      cursorOffset = insertion.length;
      break;
    case 'ul':
      insertion = `\n- ${selected || 'List item'}\n`;
      cursorOffset = insertion.length;
      break;
    case 'ol':
      insertion = `\n1. ${selected || 'List item'}\n`;
      cursorOffset = insertion.length;
      break;
    case 'task':
      insertion = `\n- [ ] ${selected || 'Task item'}\n`;
      cursorOffset = insertion.length;
      break;
    case 'code':
      insertion = selected ? `\n\`\`\`\n${selected}\n\`\`\`\n` : '\n```\ncode\n```\n';
      cursorOffset = insertion.length;
      break;
    case 'inlinecode':
      insertion = `\`${selected || 'code'}\``;
      cursorOffset = selected ? insertion.length : 1;
      break;
    case 'link':
      insertion = `[${selected || 'link text'}](url)`;
      cursorOffset = selected ? insertion.length - 1 : 1;
      break;
    case 'image':
      insertion = `![${selected || 'alt text'}](image-url)`;
      cursorOffset = insertion.length;
      break;
    case 'quote':
      insertion = `\n> ${selected || 'Quote text'}\n`;
      cursorOffset = insertion.length;
      break;
    case 'hr':
      insertion = '\n\n---\n\n';
      cursorOffset = insertion.length;
      break;
    case 'table':
      insertion = '\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n';
      cursorOffset = insertion.length;
      break;
    default:
      return { newContent: content, cursorPos: start };
  }

  const newContent = content.substring(0, start) + insertion + content.substring(end);
  return { newContent, cursorPos: start + cursorOffset };
}

// ── Export ────────────────────────────────────────────────────
export function exportNote(note: Note, format: 'md' | 'html' | 'txt') {
  let content: string;
  let mimeType: string;
  let ext: string;

  switch (format) {
    case 'md':
      content = `# ${note.title}\n\n${note.content}`;
      mimeType = 'text/markdown';
      ext = 'md';
      break;
    case 'html':
      content = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${note.title}</title>
<style>body{font-family:Segoe UI,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#333;line-height:1.7}
h1{color:#2b579a;border-bottom:2px solid #2b579a;padding-bottom:.5rem}
pre{background:#f5f5f5;padding:1rem;border-radius:4px;overflow-x:auto}
code{background:#f0f0f0;padding:2px 4px;border-radius:3px}
blockquote{border-left:3px solid #2b579a;padding-left:1rem;color:#666}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px}</style>
</head><body><h1>${note.title}</h1>${renderMarkdown(note.content)}</body></html>`;
      mimeType = 'text/html';
      ext = 'html';
      break;
    case 'txt':
      content = `${note.title}\n${'='.repeat(note.title.length)}\n\n${note.content.replace(/[#*`>\-\[\]()]/g, '')}`;
      mimeType = 'text/plain';
      ext = 'txt';
      break;
  }

  const blob = new Blob([content!], { type: mimeType! });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAllNotes(notes: Note[]) {
  const content = notes.map(n => `# ${n.title}\n\n${n.content}\n\n---\n`).join('\n');
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'all_notes.md';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Import ───────────────────────────────────────────────────
export function importMarkdownFile(): Promise<Note[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt,.markdown';
    input.multiple = true;
    input.onchange = () => {
      const files = input.files;
      if (!files) return resolve([]);
      const promises = Array.from(files).map(file =>
        new Promise<Note>((res) => {
          const reader = new FileReader();
          reader.onload = () => {
            const text = reader.result as string;
            const lines = text.split('\n');
            let title = file.name.replace(/\.(md|txt|markdown)$/i, '');
            let content = text;
            // Extract title from first heading if present
            if (lines[0]?.startsWith('# ')) {
              title = lines[0].replace(/^#\s+/, '');
              content = lines.slice(1).join('\n').trim();
            }
            res({
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
              title,
              content,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              folderId: 'all',
              tags: [],
              pinned: false,
              favorite: false,
              archived: false,
              versions: [],
              wordGoal: 0,
              color: '',
            });
          };
          reader.readAsText(file);
        })
      );
      Promise.all(promises).then(resolve);
    };
    input.click();
  });
}

// ── Templates ────────────────────────────────────────────────
export const TEMPLATES = [
  {
    name: 'Meeting Notes',
    icon: '📋',
    content: `# Meeting Notes\n\n**Date:** ${new Date().toLocaleDateString()}\n**Attendees:** \n**Location:** \n\n## Agenda\n1. \n2. \n3. \n\n## Discussion\n\n\n## Action Items\n- [ ] \n- [ ] \n\n## Next Meeting\n**Date:** \n**Topics:** `,
  },
  {
    name: 'Daily Journal',
    icon: '📔',
    content: `# ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}\n\n## 🌅 Morning\n- Mood: \n- Goals for today:\n  - [ ] \n  - [ ] \n\n## 📝 Notes\n\n\n## 🌙 Evening Reflection\n- What went well:\n- What to improve:\n- Grateful for:\n`,
  },
  {
    name: 'Project Plan',
    icon: '🚀',
    content: `# Project: [Name]\n\n## Overview\nBrief description of the project.\n\n## Goals\n- [ ] Goal 1\n- [ ] Goal 2\n- [ ] Goal 3\n\n## Timeline\n| Phase | Start | End | Status |\n|-------|-------|-----|--------|\n| Planning | | | 🟡 |\n| Development | | | ⚪ |\n| Testing | | | ⚪ |\n| Launch | | | ⚪ |\n\n## Resources\n- \n\n## Notes\n`,
  },
  {
    name: 'Bug Report',
    icon: '🐛',
    content: `# Bug Report\n\n**Title:** \n**Severity:** 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low\n**Status:** Open\n**Reporter:** \n**Date:** ${new Date().toLocaleDateString()}\n\n## Description\n\n\n## Steps to Reproduce\n1. \n2. \n3. \n\n## Expected Behavior\n\n\n## Actual Behavior\n\n\n## Environment\n- OS: \n- Browser: \n- Version: \n\n## Screenshots\n\n`,
  },
  {
    name: 'README',
    icon: '📖',
    content: `# Project Name\n\n> Short description\n\n## Installation\n\n\`\`\`bash\nnpm install project-name\n\`\`\`\n\n## Usage\n\n\`\`\`javascript\nimport { something } from 'project-name';\n\`\`\`\n\n## Features\n- Feature 1\n- Feature 2\n- Feature 3\n\n## API\n\n### \`methodName()\`\nDescription of method.\n\n| Parameter | Type | Default | Description |\n|-----------|------|---------|-------------|\n| param1 | string | '' | Description |\n\n## Contributing\n\n1. Fork it\n2. Create your branch\n3. Commit changes\n4. Push to branch\n5. Open a PR\n\n## License\nMIT\n`,
  },
  {
    name: 'Blank Note',
    icon: '📄',
    content: '',
  },
];

// ── Find & Replace ───────────────────────────────────────────
export function findInText(
  text: string,
  query: string,
  caseSensitive: boolean,
  useRegex: boolean
): { start: number; end: number }[] {
  if (!query) return [];
  const matches: { start: number; end: number }[] = [];
  try {
    const flags = caseSensitive ? 'g' : 'gi';
    const pattern = useRegex ? new RegExp(query, flags) : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    let match;
    while ((match = pattern.exec(text)) !== null) {
      matches.push({ start: match.index, end: match.index + match[0].length });
      if (match.index === pattern.lastIndex) pattern.lastIndex++;
    }
  } catch { /* invalid regex */ }
  return matches;
}

export function replaceInText(
  text: string,
  find: string,
  replace: string,
  caseSensitive: boolean,
  useRegex: boolean,
  all: boolean
): string {
  if (!find) return text;
  try {
    const flags = all ? (caseSensitive ? 'g' : 'gi') : (caseSensitive ? '' : 'i');
    const pattern = useRegex ? new RegExp(find, flags) : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    return all ? text.replace(pattern, replace) : text.replace(pattern, replace);
  } catch { return text; }
}
