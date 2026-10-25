import { useReducer, useEffect, useRef } from 'react';
import { Notebook, Section, Page, AppState } from '../types';

const STORAGE_KEY = 'onenote-lite-v1';

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* storage full */ }
}

// Seed data
const seedNotebooks: Notebook[] = [
  {
    id: 'nb-welcome',
    name: 'Getting Started',
    color: '#7719AA',
    sections: [
      {
        id: 'sec-welcome',
        name: 'Welcome',
        color: '#A259FF',
        pages: [
          {
            id: 'pg-welcome',
            title: 'Welcome to OneNote Lite',
            content: '# Welcome to OneNote Lite! 📝\n\nThis is your new note-taking workspace organized like Microsoft OneNote.\n\n## How It Works\n\n### Notebooks\nNotebooks are your top-level containers. Create separate notebooks for different areas of your life:\n- **Work** - projects, meetings, tasks\n- **Personal** - journal, ideas, recipes\n- **Study** - classes, research, notes\n\n### Sections\nInside each notebook, create sections to organize related pages. Sections have colored tabs for quick visual identification.\n\n### Pages\nPages are where you actually write content. Each page has a title and supports rich text formatting.\n\n## Getting Started\n\n1. Click the **+** button next to "Notebooks" to create a new notebook\n2. Click the **+** button next to a notebook to add a section\n3. Click the **+** button next to a section to add a page\n4. Start writing!\n\n## Tips\n\n- Your notes save automatically as you type\n- Use the search box to find content across all notebooks\n- Right-click (or long-press on mobile) any item to rename, change color, or delete\n- All data stays on your device - nothing is sent to any server\n\nHappy note-taking! 🎉',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'pg-markdown',
            title: 'Markdown Cheat Sheet',
            content: '# Markdown Cheat Sheet\n\nThis page shows you the markdown syntax you can use in your notes.\n\n## Headings\n\n# Heading 1\n## Heading 2\n### Heading 3\n\n## Text Formatting\n\n**Bold text** using double asterisks\n\n*Italic text* using single asterisks\n\n~~Strikethrough~~ using double tildes\n\n`Inline code` using backticks\n\n## Lists\n\n### Unordered List\n- Item 1\n- Item 2\n  - Nested item\n  - Another nested item\n- Item 3\n\n### Ordered List\n1. First item\n2. Second item\n3. Third item\n\n### Task List\n- [x] Completed task\n- [ ] Incomplete task\n- [ ] Another task\n\n## Links & Images\n\n[Link text](https://example.com)\n\n![Image alt text](image-url.jpg)\n\n## Code Blocks\n\n```javascript\nfunction hello() {\n  console.log("Hello, World!");\n}\n```\n\n## Blockquotes\n\n> This is a blockquote.\n> It can span multiple lines.\n\n## Tables\n\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n\n## Horizontal Rule\n\n---\n\nThat\'s the basics! Now go create some amazing notes! 🚀',
            createdAt: Date.now() - 1000,
            updatedAt: Date.now() - 1000,
          },
        ],
      },
      {
        id: 'sec-tips',
        name: 'Tips & Tricks',
        color: '#10B981',
        pages: [
          {
            id: 'pg-tips',
            title: 'Productivity Tips',
            content: '# Productivity Tips\n\n## Organize Effectively\n\n1. **Start broad, then narrow down**\n   - Create notebooks for major life areas\n   - Use sections for projects or topics\n   - Keep pages focused on single subjects\n\n2. **Use colors strategically**\n   - Assign colors to notebooks/sections\n   - Use color coding for priority or status\n   - Keep related items in similar colors\n\n3. **Name things clearly**\n   - Use descriptive notebook names\n   - Make section names scannable\n   - Give pages clear, searchable titles\n\n## Writing Tips\n\n- **Write regularly** - Even 5 minutes a day adds up\n- **Review your notes** - Revisit old notes to reinforce learning\n- **Link related ideas** - Reference other pages in your notes\n- **Use templates** - Create consistent structures for meeting notes, journal entries, etc.\n\n## Search Tips\n\n- Search across all notebooks at once\n- Use specific keywords from your notes\n- Search finds matches in both titles and content\n\n## Backup Your Data\n\nSince all data stays on your device:\n- Export important notebooks regularly\n- Consider using browser sync if available\n- Your notes are stored in browser localStorage\n\nHappy organizing! 📚',
            createdAt: Date.now() - 2000,
            updatedAt: Date.now() - 2000,
          },
        ],
      },
    ],
  },
  {
    id: 'nb-work',
    name: 'Work Notebook',
    color: '#2B579A',
    sections: [
      {
        id: 'sec-meetings',
        name: 'Meetings',
        color: '#F59E0B',
        pages: [
          {
            id: 'pg-meeting-template',
            title: 'Meeting Notes Template',
            content: '# Meeting Notes\n\n**Date:** [Date]\n**Attendees:** [Names]\n**Location:** [Room/Link]\n\n## Agenda\n\n1. [Topic 1]\n2. [Topic 2]\n3. [Topic 3]\n\n## Discussion\n\n### Topic 1\n- Key points\n- Decisions made\n- Action items\n\n### Topic 2\n- Key points\n- Decisions made\n- Action items\n\n## Action Items\n\n- [ ] [Action item 1] - [Owner] - [Due date]\n- [ ] [Action item 2] - [Owner] - [Due date]\n- [ ] [Action item 3] - [Owner] - [Due date]\n\n## Next Meeting\n\n**Date:** [Date]\n**Time:** [Time]\n**Topics to cover:**\n- [Topic 1]\n- [Topic 2]',
            createdAt: Date.now() - 3000,
            updatedAt: Date.now() - 3000,
          },
        ],
      },
      {
        id: 'sec-projects',
        name: 'Projects',
        color: '#EF4444',
        pages: [
          {
            id: 'pg-project-template',
            title: 'Project Planning Template',
            content: '# Project: [Project Name]\n\n## Overview\n\n**Project Goal:** [What are we trying to achieve?]\n**Timeline:** [Start date] - [End date]\n**Status:** 🟢 On Track / 🟡 At Risk / 🔴 Blocked\n\n## Objectives\n\n- [ ] Objective 1\n- [ ] Objective 2\n- [ ] Objective 3\n\n## Key Milestones\n\n| Milestone | Target Date | Status |\n|-----------|-------------|--------|\n| Milestone 1 | [Date] | ⚪ Not Started |\n| Milestone 2 | [Date] | ⚪ Not Started |\n| Milestone 3 | [Date] | ⚪ Not Started |\n\n## Resources\n\n### Team\n- [Name] - [Role]\n- [Name] - [Role]\n\n### Tools & Systems\n- [Tool 1]\n- [Tool 2]\n\n## Risks & Issues\n\n| Risk/Issue | Impact | Mitigation |\n|------------|--------|------------|\n| [Risk 1] | High/Med/Low | [Plan] |\n| [Risk 2] | High/Med/Low | [Plan] |\n\n## Notes\n\n[Any additional notes, links, or references]',
            createdAt: Date.now() - 4000,
            updatedAt: Date.now() - 4000,
          },
        ],
      },
    ],
  },
];

function getInitialState(): AppState {
  const saved = loadState();
  const notebooks = saved?.notebooks?.length ? saved.notebooks : seedNotebooks;
  
  // Find first page to activate
  let activeNotebookId = saved?.activeNotebookId || notebooks[0]?.id || '';
  let activeSectionId = saved?.activeSectionId || '';
  let activePageId = saved?.activePageId || '';
  
  // If no active IDs saved, find the first page
  if (!activeSectionId || !activePageId) {
    const firstNotebook = notebooks[0];
    if (firstNotebook && firstNotebook.sections.length > 0) {
      activeNotebookId = firstNotebook.id;
      activeSectionId = firstNotebook.sections[0].id;
      if (firstNotebook.sections[0].pages.length > 0) {
        activePageId = firstNotebook.sections[0].pages[0].id;
      }
    }
  }
  
  return {
    notebooks,
    activeNotebookId,
    activeSectionId,
    activePageId,
    searchQuery: '',
    isDark: saved?.isDark || false,
    sidebarOpen: saved?.sidebarOpen !== undefined ? saved.sidebarOpen : true,
    autoSaveStatus: 'saved',
  };
}

type Action =
  | { type: 'CREATE_NOTEBOOK'; name: string; color: string }
  | { type: 'UPDATE_NOTEBOOK'; id: string; updates: Partial<Pick<Notebook, 'name' | 'color'>> }
  | { type: 'DELETE_NOTEBOOK'; id: string }
  | { type: 'CREATE_SECTION'; notebookId: string; name: string; color: string }
  | { type: 'UPDATE_SECTION'; notebookId: string; sectionId: string; updates: Partial<Pick<Section, 'name' | 'color'>> }
  | { type: 'DELETE_SECTION'; notebookId: string; sectionId: string }
  | { type: 'CREATE_PAGE'; notebookId: string; sectionId: string; title: string }
  | { type: 'UPDATE_PAGE'; notebookId: string; sectionId: string; pageId: string; updates: Partial<Pick<Page, 'title' | 'content'>> }
  | { type: 'DELETE_PAGE'; notebookId: string; sectionId: string; pageId: string }
  | { type: 'SET_ACTIVE_NOTEBOOK'; id: string }
  | { type: 'SET_ACTIVE_SECTION'; id: string }
  | { type: 'SET_ACTIVE_PAGE'; id: string }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'TOGGLE_DARK' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SAVE_STATUS'; status: AppState['autoSaveStatus'] };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'CREATE_NOTEBOOK': {
      const notebook: Notebook = {
        id: uid(),
        name: action.name,
        color: action.color,
        sections: [],
      };
      return {
        ...state,
        notebooks: [...state.notebooks, notebook],
        activeNotebookId: notebook.id,
        activeSectionId: '',
        activePageId: '',
      };
    }

    case 'UPDATE_NOTEBOOK':
      return {
        ...state,
        notebooks: state.notebooks.map(nb =>
          nb.id === action.id ? { ...nb, ...action.updates } : nb
        ),
      };

    case 'DELETE_NOTEBOOK': {
      const filtered = state.notebooks.filter(nb => nb.id !== action.id);
      let newActiveNotebookId = state.activeNotebookId;
      let newActiveSectionId = state.activeSectionId;
      let newActivePageId = state.activePageId;
      
      if (state.activeNotebookId === action.id) {
        newActiveNotebookId = filtered[0]?.id || '';
        newActiveSectionId = '';
        newActivePageId = '';
        if (filtered[0]?.sections[0]?.pages[0]) {
          newActiveSectionId = filtered[0].sections[0].id;
          newActivePageId = filtered[0].sections[0].pages[0].id;
        }
      }
      
      return {
        ...state,
        notebooks: filtered,
        activeNotebookId: newActiveNotebookId,
        activeSectionId: newActiveSectionId,
        activePageId: newActivePageId,
      };
    }

    case 'CREATE_SECTION': {
      const section: Section = {
        id: uid(),
        name: action.name,
        color: action.color,
        pages: [],
      };
      return {
        ...state,
        notebooks: state.notebooks.map(nb =>
          nb.id === action.notebookId
            ? { ...nb, sections: [...nb.sections, section] }
            : nb
        ),
        activeSectionId: section.id,
        activePageId: '',
      };
    }

    case 'UPDATE_SECTION':
      return {
        ...state,
        notebooks: state.notebooks.map(nb =>
          nb.id === action.notebookId
            ? {
                ...nb,
                sections: nb.sections.map(sec =>
                  sec.id === action.sectionId ? { ...sec, ...action.updates } : sec
                ),
              }
            : nb
        ),
      };

    case 'DELETE_SECTION': {
      const notebook = state.notebooks.find(nb => nb.id === action.notebookId);
      if (!notebook) return state;
      
      const filteredSections = notebook.sections.filter(sec => sec.id !== action.sectionId);
      let newActiveSectionId = state.activeSectionId;
      let newActivePageId = state.activePageId;
      
      if (state.activeSectionId === action.sectionId) {
        newActiveSectionId = filteredSections[0]?.id || '';
        newActivePageId = filteredSections[0]?.pages[0]?.id || '';
      }
      
      return {
        ...state,
        notebooks: state.notebooks.map(nb =>
          nb.id === action.notebookId
            ? { ...nb, sections: filteredSections }
            : nb
        ),
        activeSectionId: newActiveSectionId,
        activePageId: newActivePageId,
      };
    }

    case 'CREATE_PAGE': {
      const page: Page = {
        id: uid(),
        title: action.title,
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return {
        ...state,
        notebooks: state.notebooks.map(nb =>
          nb.id === action.notebookId
            ? {
                ...nb,
                sections: nb.sections.map(sec =>
                  sec.id === action.sectionId
                    ? { ...sec, pages: [...sec.pages, page] }
                    : sec
                ),
              }
            : nb
        ),
        activePageId: page.id,
      };
    }

    case 'UPDATE_PAGE':
      return {
        ...state,
        notebooks: state.notebooks.map(nb =>
          nb.id === action.notebookId
            ? {
                ...nb,
                sections: nb.sections.map(sec =>
                  sec.id === action.sectionId
                    ? {
                        ...sec,
                        pages: sec.pages.map(pg =>
                          pg.id === action.pageId
                            ? { ...pg, ...action.updates, updatedAt: Date.now() }
                            : pg
                        ),
                      }
                    : sec
                ),
              }
            : nb
        ),
        autoSaveStatus: 'unsaved',
      };

    case 'DELETE_PAGE': {
      const notebook = state.notebooks.find(nb => nb.id === action.notebookId);
      const section = notebook?.sections.find(sec => sec.id === action.sectionId);
      if (!notebook || !section) return state;
      
      const filteredPages = section.pages.filter(pg => pg.id !== action.pageId);
      let newActivePageId = state.activePageId;
      
      if (state.activePageId === action.pageId) {
        newActivePageId = filteredPages[0]?.id || '';
      }
      
      return {
        ...state,
        notebooks: state.notebooks.map(nb =>
          nb.id === action.notebookId
            ? {
                ...nb,
                sections: nb.sections.map(sec =>
                  sec.id === action.sectionId
                    ? { ...sec, pages: filteredPages }
                    : sec
                ),
              }
            : nb
        ),
        activePageId: newActivePageId,
      };
    }

    case 'SET_ACTIVE_NOTEBOOK':
      return { ...state, activeNotebookId: action.id };

    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSectionId: action.id };

    case 'SET_ACTIVE_PAGE':
      return { ...state, activePageId: action.id };

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };

    case 'TOGGLE_DARK':
      return { ...state, isDark: !state.isDark };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_SAVE_STATUS':
      return { ...state, autoSaveStatus: action.status };

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
    }, 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state.notebooks, state.activeNotebookId, state.activeSectionId, state.activePageId, state.isDark, state.sidebarOpen]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.isDark);
  }, [state.isDark]);

  // Get active page
  const activeNotebook = state.notebooks.find(nb => nb.id === state.activeNotebookId);
  const activeSection = activeNotebook?.sections.find(sec => sec.id === state.activeSectionId);
  const activePage = activeSection?.pages.find(pg => pg.id === state.activePageId);

  return { state, dispatch, activeNotebook, activeSection, activePage };
}
