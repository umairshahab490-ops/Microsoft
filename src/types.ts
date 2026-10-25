// OneNote-style hierarchy: Notebook > Section > Page

export interface Page {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Section {
  id: string;
  name: string;
  color: string;
  pages: Page[];
}

export interface Notebook {
  id: string;
  name: string;
  color: string;
  sections: Section[];
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

export interface AppState {
  notebooks: Notebook[];
  activeNotebookId: string;
  activeSectionId: string;
  activePageId: string;
  searchQuery: string;
  isDark: boolean;
  sidebarOpen: boolean;
  autoSaveStatus: SaveStatus;
}
