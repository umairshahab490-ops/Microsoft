export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  folderId: string;
  tags: string[];
  pinned: boolean;
  favorite: boolean;
  archived: boolean;
  versions: NoteVersion[];
  wordGoal: number;
  color: string;
}

export interface NoteVersion {
  id: string;
  content: string;
  timestamp: number;
  label: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export type SortBy = 'updatedAt' | 'createdAt' | 'title';
export type SortDir = 'asc' | 'desc';
export type SaveStatus = 'saved' | 'saving' | 'unsaved';
export type PomodoroType = 'work' | 'break';

export interface AppState {
  notes: Note[];
  folders: Folder[];
  trash: Note[];
  activeNoteId: string;
  activeFolderId: string;
  searchQuery: string;
  isPreview: boolean;
  isDark: boolean;
  isFullscreen: boolean;
  isFocusMode: boolean;
  isSplitView: boolean;
  sidebarOpen: boolean;
  sortBy: SortBy;
  sortDir: SortDir;
  showFavorites: boolean;
  showArchived: boolean;
  showTrash: boolean;
  fontSize: number;
  fontFamily: string;
  showLineNumbers: boolean;
  wordWrap: boolean;
  activeTag: string | null;
  showSettings: boolean;
  showShortcuts: boolean;
  showExport: boolean;
  showTemplates: boolean;
  showFindReplace: boolean;
  showCommandPalette: boolean;
  showCheatsheet: boolean;
  showStats: boolean;
  showVersions: boolean;
  showEmojiPicker: boolean;
  showQuickNote: boolean;
  showPomodoro: boolean;
  showTOC: boolean;
  selectedNoteIds: string[];
  findQuery: string;
  replaceQuery: string;
  findCaseSensitive: boolean;
  findRegex: boolean;
  undoStack: string[];
  redoStack: string[];
  autoSaveStatus: SaveStatus;
  accentColor: string;
  spellCheck: boolean;
  pomodoroTime: number;
  pomodoroRunning: boolean;
  pomodoroType: PomodoroType;
  commandQuery: string;
}
