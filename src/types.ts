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
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface AppState {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string;
  activeFolderId: string;
  searchQuery: string;
  isPreview: boolean;
  isDark: boolean;
  isFullscreen: boolean;
  sidebarOpen: boolean;
  sortBy: 'updatedAt' | 'createdAt' | 'title';
  sortDir: 'asc' | 'desc';
  showFavorites: boolean;
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
  findQuery: string;
  replaceQuery: string;
  findCaseSensitive: boolean;
  findRegex: boolean;
  undoStack: string[][];
  redoStack: string[][];
  autoSaveStatus: 'saved' | 'saving' | 'unsaved';
}

export type SortOption = 'updatedAt' | 'createdAt' | 'title';
