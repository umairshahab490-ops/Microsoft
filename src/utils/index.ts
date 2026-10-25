import { marked } from 'marked';

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

// ── Stats ────────────────────────────────────────────────────
export function getStats(content: string) {
  const chars = content.length;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lines = content.split('\n').length;
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim()).length;
  const readTime = Math.max(1, Math.ceil(words / 200));
  return { chars, words, lines, paragraphs, readTime };
}

// ── Markdown insertion helpers ───────────────────────────────
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
    case 'quote':
      insertion = `\n> ${selected || 'Quote text'}\n`;
      cursorOffset = insertion.length;
      break;
    case 'hr':
      insertion = '\n\n---\n\n';
      cursorOffset = insertion.length;
      break;
    case 'table':
      insertion = '\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n';
      cursorOffset = insertion.length;
      break;
    default:
      return { newContent: content, cursorPos: start };
  }

  const newContent = content.substring(0, start) + insertion + content.substring(end);
  return { newContent, cursorPos: start + cursorOffset };
}
