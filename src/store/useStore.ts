import { useReducer, useEffect, useRef } from 'react';
import { Note, Folder, AppState, SortBy, SortDir } from '../types';

const STORAGE_KEY = 'wordnotes-v3';

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
      trash: state.trash,
      activeNoteId: state.activeNoteId,
      activeFolderId: state.activeFolderId,
      isDark: state.isDark,
      sortBy: state.sortBy,
      sortDir: state.sortDir,
      fontSize: state.fontSize,
      fontFamily: state.fontFamily,
      showLineNumbers: state.showLineNumbers,
      wordWrap: state.wordWrap,
      accentColor: state.accentColor,
      spellCheck: state.spellCheck,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* storage full */ }
}

const defaultFolders: Folder[] = [
  { id: 'all', name: 'All Notes', color: '#2b579a', icon: '📁' },
  { id: 'personal', name: 'Personal', color: '#10b981', icon: '👤' },
  { id: 'work', name: 'Work', color: '#f59e0b', icon: '💼' },
  { id: 'ideas', name: 'Ideas', color: '#8b5cf6', icon: '💡' },
];

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: uid(),
    title: 'Untitled Note',
    content: '',
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
    ...overrides,
  };
}

const defaultNote: Note = makeNote({
  title: 'Welcome to Word Notes Pro',
  content: `# Welcome to Word Notes Pro 📝

A **full-featured** note-taking app styled like Microsoft Word.

## ✨ Features

### Editor
- **Markdown** editing with live preview
- **Split View** — edit and preview side by side
- Rich formatting toolbar
- Find & Replace with regex support
- Line numbers & word wrap toggle
- Adjustable font size & family
- **Typewriter/Focus Mode** — center your writing
- **Table of Contents** — auto-generated from headings
- **Emoji Picker** — quick emoji insertion
- **Clipboard Image Paste** — paste images directly
- **Spell Check** toggle

### Organization
- 📁 Folders with custom colors & icons
- 🏷️ Tags for flexible labeling
- 📌 Pin important notes to top
- ⭐ Mark favorites
- 🗂️ Archive old notes
- 🗑️ Trash with recovery (30 days)
- 🔍 Instant search across all notes
- Sort by name, created, or modified date
- **Multi-select** notes for bulk operations
- **Drag & drop** to reorder

### Productivity
- ⌨️ Full keyboard shortcuts
- ↩️ Undo / Redo support
- 📋 Note templates
- 📤 Export as Markdown, HTML, Text, or PDF
- 📥 Import markdown files
- 💾 Backup & Restore all data
- 🖥️ Fullscreen / distraction-free mode
- 🌙 Dark mode with custom accent colors
- ⏱️ **Pomodoro Timer** for focus sessions
- 📊 **Writing Statistics** dashboard
- 🎯 **Word Goals** per note
- 📜 **Version History** — track changes
- 🔗 **Wiki-style Links** — [[note name]]
- 🎨 **Command Palette** (Ctrl+K)
- 🖨️ **Print/PDF** optimized output

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+N | New note |
| Ctrl+P | Toggle preview |
| Ctrl+F | Find |
| Ctrl+H | Find & Replace |
| Ctrl+D | Delete note |
| Ctrl+E | Export |
| Ctrl+K | Command Palette |
| Ctrl+\\\\ | Toggle sidebar |
| Ctrl+Shift+F | Fullscreen |
| Ctrl+Shift+S | Split View |
| Ctrl+Shift+T | Focus Mode |
| Ctrl+↑/↓ | Navigate notes |
| Ctrl+Shift+D | Duplicate note |
| Ctrl+Z / Y | Undo / Redo |
| Ctrl+B / I | Bold / Italic |

## 📝 Markdown Examples

> Blockquote for important info

\`\`\`javascript
function hello() {
  console.log("Hello!");
}
\`\`\`

- [x] Create the app
- [x] Add markdown support
- [ ] Take over the world

| Feature | Status |
|---------|--------|
| Editor | ✅ Done |
| Preview | ✅ Done |
| Export | ✅ Done |

---

*Happy writing!* 🚀`,
  pinned: true,
  favorite: true,
  tags: ['welcome', 'tutorial'],
});

function getInitialState(): AppState {
  const saved = loadState();
  const notes = saved?.notes?.length ? saved.notes : [defaultNote];
  const folders = saved?.folders?.length ? saved.folders : defaultFolders;
  return {
    notes,
    folders,
    trash: saved?.trash || [],
    activeNoteId: saved?.activeNoteId || notes[0]?.id || '',
    activeFolderId: saved?.activeFolderId || 'all',
    searchQuery: '',
    isPreview: false,
    isDark: saved?.isDark || false,
    isFullscreen: false,
    isFocusMode: false,
    isSplitView: false,
    sidebarOpen: true,
    sortBy: saved?.sortBy || 'updatedAt',
    sortDir: saved?.sortDir || 'desc',
    showFavorites: false,
    showArchived: false,
    showTrash: false,
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
    showCommandPalette: false,
    showCheatsheet: false,
    showStats: false,
    showVersions: false,
    showEmojiPicker: false,
    showQuickNote: false,
    showPomodoro: false,
    showTOC: false,
    selectedNoteIds: [],
    findQuery: '',
    replaceQuery: '',
    findCaseSensitive: false,
    findRegex: false,
    undoStack: [],
    redoStack: [],
    autoSaveStatus: 'saved',
    accentColor: saved?.accentColor || '#2b579a',
    spellCheck: saved?.spellCheck !== undefined ? saved.spellCheck : true,
    pomodoroTime: 25 * 60,
    pomodoroRunning: false,
    pomodoroType: 'work',
    commandQuery: '',
  };
}

type Action =
  | { type: 'CREATE_NOTE' }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'TRASH_NOTE'; id: string }
  | { type: 'RESTORE_NOTE'; id: string }
  | { type: 'EMPTY_TRASH' }
  | { type: 'DUPLICATE_NOTE'; id: string }
  | { type: 'UPDATE_NOTE'; id: string; updates: Partial<Note> }
  | { type: 'SET_ACTIVE_NOTE'; id: string }
  | { type: 'SET_ACTIVE_FOLDER'; id: string }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'TOGGLE_DARK' }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'TOGGLE_FOCUS_MODE' }
  | { type: 'TOGGLE_SPLIT_VIEW' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SORT'; by: SortBy; dir: SortDir }
  | { type: 'TOGGLE_FAVORITES' }
  | { type: 'TOGGLE_ARCHIVED' }
  | { type: 'TOGGLE_TRASH_VIEW' }
  | { type: 'SET_FONT_SIZE'; size: number }
  | { type: 'SET_FONT_FAMILY'; family: string }
  | { type: 'TOGGLE_LINE_NUMBERS' }
  | { type: 'TOGGLE_WORD_WRAP' }
  | { type: 'SET_ACTIVE_TAG'; tag: string | null }
  | { type: 'TOGGLE_MODAL'; modal: string }
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
  | { type: 'APPLY_TEMPLATE'; template: Partial<Note> }
  | { type: 'TOGGLE_SELECT'; id: string }
  | { type: 'SELECT_ALL' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'BULK_DELETE' }
  | { type: 'BULK_ARCHIVE' }
  | { type: 'BULK_TAG'; tag: string }
  | { type: 'SAVE_VERSION'; id: string; label: string }
  | { type: 'RESTORE_VERSION'; noteId: string; versionId: string }
  | { type: 'SET_ACCENT_COLOR'; color: string }
  | { type: 'TOGGLE_SPELL_CHECK' }
  | { type: 'SET_POMODORO_TIME'; time: number }
  | { type: 'TOGGLE_POMODORO' }
  | { type: 'SET_POMODORO_TYPE'; pomodoroType: AppState['pomodoroType'] }
  | { type: 'SET_COMMAND_QUERY'; query: string }
  | { type: 'REORDER_NOTES'; fromIndex: number; toIndex: number }
  | { type: 'BACKUP_DATA' }
  | { type: 'RESTORE_DATA'; data: AppState };

function closeAllModals(state: AppState): Partial<AppState> {
  return {
    showSettings: false,
    showShortcuts: false,
    showExport: false,
    showTemplates: false,
    showFindReplace: false,
    showCommandPalette: false,
    showCheatsheet: false,
    showStats: false,
    showVersions: false,
    showEmojiPicker: false,
    showQuickNote: false,
    showPomodoro: false,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'CREATE_NOTE': {
      const note = makeNote({
        folderId: state.activeFolderId === 'all' ? 'all' : state.activeFolderId,
      });
      return {
        ...state,
        notes: [note, ...state.notes],
        activeNoteId: note.id,
        isPreview: false,
        autoSaveStatus: 'unsaved',
        showArchived: false,
        showTrash: false,
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

    case 'TRASH_NOTE': {
      const note = state.notes.find(n => n.id === action.id);
      if (!note) return state;
      const filtered = state.notes.filter(n => n.id !== action.id);
      let newActiveId = state.activeNoteId;
      if (state.activeNoteId === action.id) {
        newActiveId = filtered[0]?.id || '';
      }
      return {
        ...state,
        notes: filtered,
        trash: [{ ...note, archived: true }, ...state.trash],
        activeNoteId: newActiveId,
      };
    }

    case 'RESTORE_NOTE': {
      const note = state.trash.find(n => n.id === action.id);
      if (!note) return state;
      return {
        ...state,
        trash: state.trash.filter(n => n.id !== action.id),
        notes: [{ ...note, archived: false }, ...state.notes],
      };
    }

    case 'EMPTY_TRASH':
      return { ...state, trash: [] };

    case 'DUPLICATE_NOTE': {
      const orig = state.notes.find(n => n.id === action.id);
      if (!orig) return state;
      const dup = makeNote({
        ...orig,
        title: orig.title + ' (copy)',
        versions: [],
      });
      return { ...state, notes: [dup, ...state.notes], activeNoteId: dup.id };
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
      return { ...state, activeNoteId: action.id, isPreview: false, selectedNoteIds: [] };

    case 'SET_ACTIVE_FOLDER':
      return { ...state, activeFolderId: action.id, activeTag: null, showFavorites: false, showArchived: false, showTrash: false };

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };

    case 'TOGGLE_PREVIEW':
      return { ...state, isPreview: !state.isPreview };

    case 'TOGGLE_DARK':
      return { ...state, isDark: !state.isDark };

    case 'TOGGLE_FULLSCREEN':
      return { ...state, isFullscreen: !state.isFullscreen };

    case 'TOGGLE_FOCUS_MODE':
      return { ...state, isFocusMode: !state.isFocusMode };

    case 'TOGGLE_SPLIT_VIEW':
      return { ...state, isSplitView: !state.isSplitView };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_SORT':
      return { ...state, sortBy: action.by, sortDir: action.dir };

    case 'TOGGLE_FAVORITES':
      return { ...state, showFavorites: !state.showFavorites, activeTag: null, showArchived: false, showTrash: false };

    case 'TOGGLE_ARCHIVED':
      return { ...state, showArchived: !state.showArchived, showFavorites: false, showTrash: false, activeTag: null };

    case 'TOGGLE_TRASH_VIEW':
      return { ...state, showTrash: !state.showTrash, showFavorites: false, showArchived: false, activeTag: null };

    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.size };

    case 'SET_FONT_FAMILY':
      return { ...state, fontFamily: action.family };

    case 'TOGGLE_LINE_NUMBERS':
      return { ...state, showLineNumbers: !state.showLineNumbers };

    case 'TOGGLE_WORD_WRAP':
      return { ...state, wordWrap: !state.wordWrap };

    case 'SET_ACTIVE_TAG':
      return { ...state, activeTag: action.tag, showFavorites: false, showArchived: false, showTrash: false };

    case 'TOGGLE_MODAL': {
      const modalKey = `show${action.modal}` as keyof AppState;
      const isCurrentlyOpen = state[modalKey] as boolean;
      if (isCurrentlyOpen) {
        return { ...state, [modalKey]: false };
      }
      return { ...state, ...closeAllModals(state), [modalKey]: true };
    }

    case 'SET_FIND_QUERY':
      return { ...state, findQuery: action.query };

    case 'SET_REPLACE_QUERY':
      return { ...state, replaceQuery: action.query };

    case 'TOGGLE_FIND_CASE':
      return { ...state, findCaseSensitive: !state.findCaseSensitive };

    case 'TOGGLE_FIND_REGEX':
      return { ...state, findRegex: !state.findRegex };

    case 'PUSH_UNDO': {
      const newUndo = [...state.undoStack, action.content];
      if (newUndo.length > 100) newUndo.shift();
      return { ...state, undoStack: newUndo, redoStack: [] };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const note = state.notes.find(n => n.id === state.activeNoteId);
      if (!note) return state;
      const prev = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === state.activeNoteId ? { ...n, content: prev, updatedAt: Date.now() } : n
        ),
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, note.content],
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const note = state.notes.find(n => n.id === state.activeNoteId);
      if (!note) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === state.activeNoteId ? { ...n, content: next, updatedAt: Date.now() } : n
        ),
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, note.content],
      };
    }

    case 'SET_SAVE_STATUS':
      return { ...state, autoSaveStatus: action.status };

    case 'CREATE_FOLDER':
      return { ...state, folders: [...state.folders, action.folder] };

    case 'DELETE_FOLDER': {
      if (action.id === 'all') return state;
      return {
        ...state,
        folders: state.folders.filter(f => f.id !== action.id),
        notes: state.notes.map(n => n.folderId === action.id ? { ...n, folderId: 'all' } : n),
        activeFolderId: state.activeFolderId === action.id ? 'all' : state.activeFolderId,
      };
    }

    case 'IMPORT_NOTES':
      return { ...state, notes: [...action.notes, ...state.notes] };

    case 'APPLY_TEMPLATE': {
      const note = makeNote({
        title: action.template.title || 'Untitled',
        content: action.template.content || '',
        folderId: state.activeFolderId === 'all' ? 'all' : state.activeFolderId,
        tags: action.template.tags || [],
      });
      return { ...state, notes: [note, ...state.notes], activeNoteId: note.id, showTemplates: false };
    }

    case 'TOGGLE_SELECT': {
      const isSelected = state.selectedNoteIds.includes(action.id);
      return {
        ...state,
        selectedNoteIds: isSelected
          ? state.selectedNoteIds.filter(id => id !== action.id)
          : [...state.selectedNoteIds, action.id],
      };
    }

    case 'SELECT_ALL':
      return { ...state, selectedNoteIds: state.notes.map(n => n.id) };

    case 'CLEAR_SELECTION':
      return { ...state, selectedNoteIds: [] };

    case 'BULK_DELETE': {
      const toDelete = state.selectedNoteIds;
      return {
        ...state,
        notes: state.notes.filter(n => !toDelete.includes(n.id)),
        trash: [
          ...state.notes.filter(n => toDelete.includes(n.id)).map(n => ({ ...n, archived: true })),
          ...state.trash,
        ],
        selectedNoteIds: [],
        activeNoteId: state.selectedNoteIds.includes(state.activeNoteId)
          ? (state.notes.find(n => !toDelete.includes(n.id))?.id || '')
          : state.activeNoteId,
      };
    }

    case 'BULK_ARCHIVE':
      return {
        ...state,
        notes: state.notes.map(n =>
          state.selectedNoteIds.includes(n.id) ? { ...n, archived: true } : n
        ),
        selectedNoteIds: [],
      };

    case 'BULK_TAG':
      return {
        ...state,
        notes: state.notes.map(n =>
          state.selectedNoteIds.includes(n.id) && !n.tags.includes(action.tag)
            ? { ...n, tags: [...n.tags, action.tag] }
            : n
        ),
        selectedNoteIds: [],
      };

    case 'SAVE_VERSION': {
      const note = state.notes.find(n => n.id === action.id);
      if (!note) return state;
      const version = {
        id: uid(),
        content: note.content,
        timestamp: Date.now(),
        label: action.label || `Version ${note.versions.length + 1}`,
      };
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === action.id ? { ...n, versions: [version, ...n.versions].slice(0, 20) } : n
        ),
      };
    }

    case 'RESTORE_VERSION': {
      const note = state.notes.find(n => n.id === action.noteId);
      if (!note) return state;
      const version = note.versions.find(v => v.id === action.versionId);
      if (!version) return state;
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === action.noteId ? { ...n, content: version.content, updatedAt: Date.now() } : n
        ),
      };
    }

    case 'SET_ACCENT_COLOR':
      return { ...state, accentColor: action.color };

    case 'TOGGLE_SPELL_CHECK':
      return { ...state, spellCheck: !state.spellCheck };

    case 'SET_POMODORO_TIME':
      return { ...state, pomodoroTime: action.time };

    case 'TOGGLE_POMODORO':
      return { ...state, pomodoroRunning: !state.pomodoroRunning };

    case 'SET_POMODORO_TYPE':
      return { ...state, pomodoroType: action.pomodoroType, pomodoroTime: action.pomodoroType === 'work' ? 25 * 60 : 5 * 60 };

    case 'SET_COMMAND_QUERY':
      return { ...state, commandQuery: action.query };

    case 'REORDER_NOTES': {
      const notes = [...state.notes];
      const [moved] = notes.splice(action.fromIndex, 1);
      notes.splice(action.toIndex, 0, moved);
      return { ...state, notes };
    }

    case 'BACKUP_DATA': {
      const data = JSON.stringify(state, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wordnotes-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return state;
    }

    case 'RESTORE_DATA':
      return { ...action.data, autoSaveStatus: 'saved' };

    default:
      return state;
  }
}

export function useStore() {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    dispatch({ type: 'SET_SAVE_STATUS', status: 'saving' });
    saveTimer.current = setTimeout(() => {
      persistState(state);
      dispatch({ type: 'SET_SAVE_STATUS', status: 'saved' });
    }, 400);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state.notes, state.folders, state.trash, state.activeNoteId, state.activeFolderId, state.isDark, state.sortBy, state.sortDir, state.fontSize, state.fontFamily, state.showLineNumbers, state.wordWrap, state.accentColor, state.spellCheck]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.isDark);
  }, [state.isDark]);

  const activeNote = state.notes.find(n => n.id === state.activeNoteId) || null;

  const getFilteredNotes = () => {
    let list = [...state.notes];

    if (state.showTrash) return [];
    if (state.showArchived) return list.filter(n => n.archived);

    list = list.filter(n => !n.archived);

    if (state.activeFolderId !== 'all') {
      list = list.filter(n => n.folderId === state.activeFolderId);
    }
    if (state.showFavorites) {
      list = list.filter(n => n.favorite);
    }
    if (state.activeTag) {
      list = list.filter(n => n.tags.includes(state.activeTag!));
    }
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      );
    }

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
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    state.notes.forEach(n => { if (!n.archived) n.tags.forEach(t => tagSet.add(t)); });
    return Array.from(tagSet).sort();
  };

  return {
    state,
    dispatch,
    activeNote,
    filteredNotes: getFilteredNotes(),
    allTags: getAllTags(),
  };
}
