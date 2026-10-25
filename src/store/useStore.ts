import { useReducer, useCallback, useEffect, useRef } from 'react';
import { Note, Folder, AppState } from '../types';

// ── Storage helpers ──────────────────────────────────────────
const STORAGE_KEY = 'wordnotes-v2';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function loadState(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function persistState(state: AppState) {
  try {
    const toSave = {
      notes: state.notes,
      folders: state.folders,
      activeNoteId: state.activeNoteId,
      activeFolderId: state.activeFolderId,
      isDark: state.isDark,
      sortBy: state.sortBy,
      sortDir: state.sortDir,
      fontSize: state.fontSize,
      fontFamily: state.fontFamily,
      showLineNumbers: state.showLineNumbers,
      wordWrap: state.wordWrap,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* storage full */ }
}

// ── Default data ─────────────────────────────────────────────
const defaultFolders: Folder[] = [
  { id: 'all', name: 'All Notes', color: '#2b579a', icon: '📁' },
  { id: 'personal', name: 'Personal', color: '#10b981', icon: '👤' },
  { id: 'work', name: 'Work', color: '#f59e0b', icon: '💼' },
  { id: 'ideas', name: 'Ideas', color: '#8b5cf6', icon: '💡' },
];

const defaultNote: Note = {
  id: uid(),
  title: 'Welcome to Word Notes',
  content: `# Welcome to Word Notes Pro 📝

A **full-featured** note-taking app styled like Microsoft Word.

## ✨ Features

### Editor
- **Markdown** editing with live preview
- Rich formatting toolbar
- Find & Replace (Ctrl+H)
- Line numbers toggle
- Word wrap toggle
- Adjustable font size & family

### Organization
- 📁 Folders to categorize notes
- 🏷️ Tags for flexible labeling
- 📌 Pin important notes to top
- ⭐ Mark favorites
- 🔍 Instant search across all notes
- Sort by name, created, or modified date

### Productivity
- ⌨️ Full keyboard shortcuts
- ↩️ Undo / Redo support
- 📋 Note templates
- 📤 Export as Markdown, HTML, or Text
- 📥 Import markdown files
- 🖥️ Fullscreen / distraction-free mode
- 🌙 Dark mode

### UI
- Microsoft Word-inspired design
- Responsive layout (mobile + desktop)
- Smooth, lightweight animations
- Status bar with stats

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+N | New note |
| Ctrl+S | Force save |
| Ctrl+P | Toggle preview |
| Ctrl+F | Find |
| Ctrl+H | Find & Replace |
| Ctrl+D | Delete note |
| Ctrl+E | Export |
| Ctrl+\\ | Toggle sidebar |
| Ctrl+Shift+F | Fullscreen |
| Ctrl+↑/↓ | Navigate notes |
| Ctrl+Shift+D | Duplicate note |
| Tab | Indent |
| Shift+Tab | Outdent |

## 📝 Markdown Examples

> This is a blockquote — great for highlighting important info.

\`\`\`javascript
// Code blocks are supported
function hello() {
  console.log("Hello, World!");
}
\`\`\`

- [x] Create the app
- [x] Add markdown support
- [ ] Take over the world

---

*Happy writing!* 🚀`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  folderId: 'all',
  tags: ['welcome', 'tutorial'],
  pinned: true,
  favorite: true,
};

// ── Initial state ────────────────────────────────────────────
function getInitialState(): AppState {
  const saved = loadState();
  const notes = saved?.notes?.length ? saved.notes : [defaultNote];
  const folders = saved?.folders?.length ? saved.folders : defaultFolders;
  return {
    notes,
    folders,
    activeNoteId: saved?.activeNoteId || notes[0]?.id || '',
    activeFolderId: saved?.activeFolderId || 'all',
    searchQuery: '',
    isPreview: false,
    isDark: saved?.isDark || false,
    isFullscreen: false,
    sidebarOpen: true,
    sortBy: saved?.sortBy || 'updatedAt',
    sortDir: saved?.sortDir || 'desc',
    showFavorites: false,
    fontSize: saved?.fontSize || 14,
    fontFamily: saved?.fontFamily || 'Segoe UI',
    showLineNumbers: saved?.showLineNumbers || false,
    wordWrap: saved?.wordWrap !== undefined ? saved.wordWrap : true,
    activeTag: null,
    showSettings: false,
    showShortcuts: false,
    showExport: false,
    showTemplates: false,
    showFindReplace: false,
    findQuery: '',
    replaceQuery: '',
    findCaseSensitive: false,
    findRegex: false,
    undoStack: [],
    redoStack: [],
    autoSaveStatus: 'saved',
  };
}

// ── Action types ─────────────────────────────────────────────
type Action =
  | { type: 'CREATE_NOTE' }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'DUPLICATE_NOTE'; id: string }
  | { type: 'UPDATE_NOTE'; id: string; updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'pinned' | 'favorite' | 'folderId'>> }
  | { type: 'SET_ACTIVE_NOTE'; id: string }
  | { type: 'SET_ACTIVE_FOLDER'; id: string }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'TOGGLE_DARK' }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SORT'; by: AppState['sortBy']; dir: AppState['sortDir'] }
  | { type: 'TOGGLE_FAVORITES' }
  | { type: 'SET_FONT_SIZE'; size: number }
  | { type: 'SET_FONT_FAMILY'; family: string }
  | { type: 'TOGGLE_LINE_NUMBERS' }
  | { type: 'TOGGLE_WORD_WRAP' }
  | { type: 'SET_ACTIVE_TAG'; tag: string | null }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_SHORTCUTS' }
  | { type: 'TOGGLE_EXPORT' }
  | { type: 'TOGGLE_TEMPLATES' }
  | { type: 'TOGGLE_FIND_REPLACE' }
  | { type: 'SET_FIND_QUERY'; query: string }
  | { type: 'SET_REPLACE_QUERY'; query: string }
  | { type: 'TOGGLE_FIND_CASE' }
  | { type: 'TOGGLE_FIND_REGEX' }
  | { type: 'PUSH_UNDO'; content: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_SAVE_STATUS'; status: AppState['autoSaveStatus'] }
  | { type: 'CREATE_FOLDER'; folder: Folder }
  | { type: 'DELETE_FOLDER'; id: string }
  | { type: 'IMPORT_NOTES'; notes: Note[] }
  | { type: 'APPLY_TEMPLATE'; template: Partial<Note> };

// ── Reducer ──────────────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'CREATE_NOTE': {
      const note: Note = {
        id: uid(),
        title: 'Untitled Note',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        folderId: state.activeFolderId === 'all' ? 'all' : state.activeFolderId,
        tags: [],
        pinned: false,
        favorite: false,
      };
      return {
        ...state,
        notes: [note, ...state.notes],
        activeNoteId: note.id,
        isPreview: false,
        autoSaveStatus: 'unsaved',
      };
    }

    case 'DELETE_NOTE': {
      const filtered = state.notes.filter(n => n.id !== action.id);
      let newActiveId = state.activeNoteId;
      if (state.activeNoteId === action.id) {
        newActiveId = filtered[0]?.id || '';
      }
      return { ...state, notes: filtered, activeNoteId: newActiveId };
    }

    case 'DUPLICATE_NOTE': {
      const orig = state.notes.find(n => n.id === action.id);
      if (!orig) return state;
      const dup: Note = {
        ...orig,
        id: uid(),
        title: orig.title + ' (copy)',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return {
        ...state,
        notes: [dup, ...state.notes],
        activeNoteId: dup.id,
      };
    }

    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === action.id ? { ...n, ...action.updates, updatedAt: Date.now() } : n
        ),
        autoSaveStatus: 'unsaved',
      };

    case 'SET_ACTIVE_NOTE':
      return { ...state, activeNoteId: action.id, isPreview: false };

    case 'SET_ACTIVE_FOLDER':
      return { ...state, activeFolderId: action.id, activeTag: null, showFavorites: false };

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };

    case 'TOGGLE_PREVIEW':
      return { ...state, isPreview: !state.isPreview };

    case 'TOGGLE_DARK':
      return { ...state, isDark: !state.isDark };

    case 'TOGGLE_FULLSCREEN':
      return { ...state, isFullscreen: !state.isFullscreen };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_SORT':
      return { ...state, sortBy: action.by, sortDir: action.dir };

    case 'TOGGLE_FAVORITES':
      return { ...state, showFavorites: !state.showFavorites, activeTag: null };

    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.size };

    case 'SET_FONT_FAMILY':
      return { ...state, fontFamily: action.family };

    case 'TOGGLE_LINE_NUMBERS':
      return { ...state, showLineNumbers: !state.showLineNumbers };

    case 'TOGGLE_WORD_WRAP':
      return { ...state, wordWrap: !state.wordWrap };

    case 'SET_ACTIVE_TAG':
      return { ...state, activeTag: action.tag, showFavorites: false };

    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };

    case 'TOGGLE_SHORTCUTS':
      return { ...state, showShortcuts: !state.showShortcuts };

    case 'TOGGLE_EXPORT':
      return { ...state, showExport: !state.showExport };

    case 'TOGGLE_TEMPLATES':
      return { ...state, showTemplates: !state.showTemplates };

    case 'TOGGLE_FIND_REPLACE':
      return { ...state, showFindReplace: !state.showFindReplace };

    case 'SET_FIND_QUERY':
      return { ...state, findQuery: action.query };

    case 'SET_REPLACE_QUERY':
      return { ...state, replaceQuery: action.query };

    case 'TOGGLE_FIND_CASE':
      return { ...state, findCaseSensitive: !state.findCaseSensitive };

    case 'TOGGLE_FIND_REGEX':
      return { ...state, findRegex: !state.findRegex };

    case 'PUSH_UNDO': {
      const newUndo = [...state.undoStack, [action.content]];
      if (newUndo.length > 50) newUndo.shift();
      return { ...state, undoStack: newUndo, redoStack: [] };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const note = state.notes.find(n => n.id === state.activeNoteId);
      if (!note) return state;
      const prev = state.undoStack[state.undoStack.length - 1];
      const newUndo = state.undoStack.slice(0, -1);
      const newRedo = [...state.redoStack, [note.content]];
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === state.activeNoteId ? { ...n, content: prev[0], updatedAt: Date.now() } : n
        ),
        undoStack: newUndo,
        redoStack: newRedo,
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const note = state.notes.find(n => n.id === state.activeNoteId);
      if (!note) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      const newRedo = state.redoStack.slice(0, -1);
      const newUndo = [...state.undoStack, [note.content]];
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === state.activeNoteId ? { ...n, content: next[0], updatedAt: Date.now() } : n
        ),
        undoStack: newUndo,
        redoStack: newRedo,
      };
    }

    case 'SET_SAVE_STATUS':
      return { ...state, autoSaveStatus: action.status };

    case 'CREATE_FOLDER':
      return { ...state, folders: [...state.folders, action.folder] };

    case 'DELETE_FOLDER': {
      if (action.id === 'all') return state;
      const newFolders = state.folders.filter(f => f.id !== action.id);
      const newNotes = state.notes.map(n =>
        n.folderId === action.id ? { ...n, folderId: 'all' } : n
      );
      return {
        ...state,
        folders: newFolders,
        notes: newNotes,
        activeFolderId: state.activeFolderId === action.id ? 'all' : state.activeFolderId,
      };
    }

    case 'IMPORT_NOTES':
      return { ...state, notes: [...action.notes, ...state.notes] };

    case 'APPLY_TEMPLATE': {
      const note: Note = {
        id: uid(),
        title: action.template.title || 'Untitled',
        content: action.template.content || '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        folderId: state.activeFolderId === 'all' ? 'all' : state.activeFolderId,
        tags: action.template.tags || [],
        pinned: false,
        favorite: false,
      };
      return { ...state, notes: [note, ...state.notes], activeNoteId: note.id, showTemplates: false };
    }

    default:
      return state;
  }
}

// ── Hook ─────────────────────────────────────────────────────
export function useStore() {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist on state change (debounced)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    dispatch({ type: 'SET_SAVE_STATUS', status: 'saving' });
    saveTimer.current = setTimeout(() => {
      persistState(state);
      dispatch({ type: 'SET_SAVE_STATUS', status: 'saved' });
    }, 400);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state.notes, state.folders, state.activeNoteId, state.activeFolderId, state.isDark, state.sortBy, state.sortDir, state.fontSize, state.fontFamily, state.showLineNumbers, state.wordWrap]);

  // Dark mode class on body
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.isDark);
  }, [state.isDark]);

  const activeNote = state.notes.find(n => n.id === state.activeNoteId) || null;

  // Filtered & sorted notes
  const filteredNotes = useCallback(() => {
    let list = [...state.notes];

    // Folder filter
    if (state.activeFolderId !== 'all') {
      list = list.filter(n => n.folderId === state.activeFolderId);
    }

    // Favorites filter
    if (state.showFavorites) {
      list = list.filter(n => n.favorite);
    }

    // Tag filter
    if (state.activeTag) {
      list = list.filter(n => n.tags.includes(state.activeTag!));
    }

    // Search filter
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort: pinned first, then by criteria
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      let cmp = 0;
      switch (state.sortBy) {
        case 'title': cmp = a.title.localeCompare(b.title); break;
        case 'createdAt': cmp = a.createdAt - b.createdAt; break;
        default: cmp = a.updatedAt - b.updatedAt;
      }
      return state.sortDir === 'desc' ? -cmp : cmp;
    });

    return list;
  }, [state.notes, state.activeFolderId, state.showFavorites, state.activeTag, state.searchQuery, state.sortBy, state.sortDir]);

  // All unique tags
  const allTags = useCallback(() => {
    const tagSet = new Set<string>();
    state.notes.forEach(n => n.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [state.notes]);

  return { state, dispatch, activeNote, filteredNotes: filteredNotes(), allTags: allTags() };
}
