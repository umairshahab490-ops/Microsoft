import { formatDate } from '../utils';
import { Notebook, Section, AppState } from '../types';
import { useState, useRef, useEffect } from 'react';

interface SidebarProps {
  state: AppState;
  dispatch: React.Dispatch<any>;
  activeNotebook?: Notebook;
  activeSection?: Section;
}

const COLORS = ['#7719AA', '#A259FF', '#2B579A', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

export default function Sidebar({ state, dispatch, activeNotebook, activeSection }: SidebarProps) {
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set([state.notebooks[0]?.id]));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{ id: string; type: 'notebook' | 'section' | 'page'; x: number; y: number } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<{ id: string; type: 'notebook' | 'section' | 'page' } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) inputRef.current.focus();
  }, [editingId]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const toggleNotebook = (id: string) => {
    setExpandedNotebooks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
    setContextMenu(null);
  };

  const commitRename = () => {
    if (!editingId || !editValue.trim()) { setEditingId(null); return; }
    // Find what type this ID belongs to
    for (const nb of state.notebooks) {
      if (nb.id === editingId) {
        dispatch({ type: 'UPDATE_NOTEBOOK', id: editingId, updates: { name: editValue.trim() } });
        setEditingId(null); return;
      }
      for (const sec of nb.sections) {
        if (sec.id === editingId) {
          dispatch({ type: 'UPDATE_SECTION', notebookId: nb.id, sectionId: editingId, updates: { name: editValue.trim() } });
          setEditingId(null); return;
        }
        for (const pg of sec.pages) {
          if (pg.id === editingId) {
            dispatch({ type: 'UPDATE_PAGE', notebookId: nb.id, sectionId: sec.id, pageId: editingId, updates: { title: editValue.trim() } });
            setEditingId(null); return;
          }
        }
      }
    }
    setEditingId(null);
  };

  const handleContextMenu = (e: React.MouseEvent, id: string, type: 'notebook' | 'section' | 'page') => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ id, type, x: e.clientX, y: e.clientY });
  };

  const handleLongPress = (id: string, type: 'notebook' | 'section' | 'page') => {
    setContextMenu({ id, type, x: window.innerWidth / 2, y: window.innerHeight / 2 });
  };

  return (
    <>
      {/* Mobile overlay */}
      {state.sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/20 z-30" onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })} />
      )}

      <aside className={`fixed md:relative z-40 h-full transition-all duration-200 ${
        state.sidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:-translate-x-full'
      } overflow-hidden flex-shrink-0`}>
        <div className="h-full w-80 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/50 flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={state.searchQuery}
                onChange={e => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
                placeholder="Search all notes..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Notebooks list */}
          <div className="flex-1 overflow-y-auto p-2">
            {/* Add notebook button */}
            <button
              onClick={() => {
                const name = prompt('Notebook name:');
                if (name?.trim()) {
                  dispatch({ type: 'CREATE_NOTEBOOK', name: name.trim(), color: COLORS[state.notebooks.length % COLORS.length] });
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 mb-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Notebook
            </button>

            {/* Search results */}
            {state.searchQuery.trim() && (
              <SearchResults state={state} dispatch={dispatch} query={state.searchQuery} />
            )}

            {/* Notebooks */}
            {!state.searchQuery.trim() && state.notebooks.map(notebook => (
              <div key={notebook.id} className="mb-1">
                {/* Notebook header */}
                <div
                  className={`flex items-center gap-2 px-2 py-2 rounded-xl cursor-pointer transition-colors ${
                    state.activeNotebookId === notebook.id ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => { toggleNotebook(notebook.id); dispatch({ type: 'SET_ACTIVE_NOTEBOOK', id: notebook.id }); }}
                  onContextMenu={e => handleContextMenu(e, notebook.id, 'notebook')}
                >
                  <button
                    onClick={e => { e.stopPropagation(); toggleNotebook(notebook.id); }}
                    className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <svg className={`w-3 h-3 text-gray-500 transition-transform ${expandedNotebooks.has(notebook.id) ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: notebook.color }} />
                  {editingId === notebook.id ? (
                    <input
                      ref={inputRef}
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null); }}
                      className="flex-1 text-sm bg-white dark:bg-gray-700 border border-purple-300 rounded px-1 py-0.5 focus:outline-none dark:text-white"
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{notebook.name}</span>
                  )}
                  <span className="text-[10px] text-gray-400">{notebook.sections.length}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      const name = prompt('Section name:');
                      if (name?.trim()) {
                        dispatch({ type: 'CREATE_SECTION', notebookId: notebook.id, name: name.trim(), color: COLORS[(notebook.sections.length + 3) % COLORS.length] });
                        setExpandedNotebooks(prev => new Set([...prev, notebook.id]));
                      }
                    }}
                    className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100"
                    title="Add section"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Sections */}
                {expandedNotebooks.has(notebook.id) && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {notebook.sections.map(section => (
                      <div key={section.id}>
                        {/* Section header */}
                        <div
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                            state.activeSectionId === section.id ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                          onClick={() => {
                            dispatch({ type: 'SET_ACTIVE_NOTEBOOK', id: notebook.id });
                            dispatch({ type: 'SET_ACTIVE_SECTION', id: section.id });
                            if (section.pages[0]) dispatch({ type: 'SET_ACTIVE_PAGE', id: section.pages[0].id });
                          }}
                          onContextMenu={e => handleContextMenu(e, section.id, 'section')}
                        >
                          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: section.color }} />
                          {editingId === section.id ? (
                            <input
                              ref={inputRef}
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={commitRename}
                              onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null); }}
                              className="flex-1 text-xs bg-white dark:bg-gray-700 border border-purple-300 rounded px-1 py-0.5 focus:outline-none dark:text-white"
                              onClick={e => e.stopPropagation()}
                            />
                          ) : (
                            <span className="flex-1 text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{section.name}</span>
                          )}
                          <span className="text-[10px] text-gray-400">{section.pages.length}</span>
                        </div>

                        {/* Pages */}
                        {state.activeSectionId === section.id && (
                          <div className="ml-4 mt-0.5 space-y-0.5">
                            {section.pages.map(page => (
                              <div
                                key={page.id}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                                  state.activePageId === page.id ? 'bg-purple-100 dark:bg-purple-900/30 border-l-2 border-purple-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                                onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', id: page.id })}
                                onContextMenu={e => handleContextMenu(e, page.id, 'page')}
                              >
                                <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  {editingId === page.id ? (
                                    <input
                                      ref={inputRef}
                                      value={editValue}
                                      onChange={e => setEditValue(e.target.value)}
                                      onBlur={commitRename}
                                      onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null); }}
                                      className="w-full text-xs bg-white dark:bg-gray-700 border border-purple-300 rounded px-1 py-0.5 focus:outline-none dark:text-white"
                                      onClick={e => e.stopPropagation()}
                                    />
                                  ) : (
                                    <>
                                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{page.title || 'Untitled'}</div>
                                      <div className="text-[10px] text-gray-400 truncate">{page.content.replace(/[#*`>\-\[\]]/g, '').slice(0, 40) || 'Empty page'}</div>
                                      <div className="text-[10px] text-gray-400">{formatDate(page.updatedAt)}</div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                            {/* Add page button */}
                            <button
                              onClick={() => {
                                dispatch({ type: 'CREATE_PAGE', notebookId: notebook.id, sectionId: section.id, title: 'New Page' });
                              }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Add page
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[140px]"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 160), top: Math.min(contextMenu.y, window.innerHeight - 200) }}
        >
          <button
            onClick={() => { startRename(contextMenu.id, findName(state, contextMenu.id)); }}
            className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Rename
          </button>
          {(contextMenu.type === 'notebook' || contextMenu.type === 'section') && (
            <button
              onClick={() => { setShowColorPicker({ id: contextMenu.id, type: contextMenu.type }); setContextMenu(null); }}
              className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              Change color
            </button>
          )}
          <hr className="my-1 dark:border-gray-700" />
          <button
            onClick={() => {
              if (confirm('Delete this item?')) {
                if (contextMenu.type === 'notebook') dispatch({ type: 'DELETE_NOTEBOOK', id: contextMenu.id });
                else if (contextMenu.type === 'section') {
                  const nb = state.notebooks.find(n => n.sections.some(s => s.id === contextMenu.id));
                  if (nb) dispatch({ type: 'DELETE_SECTION', notebookId: nb.id, sectionId: contextMenu.id });
                } else if (contextMenu.type === 'page') {
                  for (const nb of state.notebooks) {
                    for (const sec of nb.sections) {
                      if (sec.pages.some(p => p.id === contextMenu.id)) {
                        dispatch({ type: 'DELETE_PAGE', notebookId: nb.id, sectionId: sec.id, pageId: contextMenu.id });
                        break;
                      }
                    }
                  }
                }
              }
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete
          </button>
        </div>
      )}

      {/* Color picker modal */}
      {showColorPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowColorPicker(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-medium mb-3 dark:text-white">Choose color</h3>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    if (showColorPicker.type === 'notebook') {
                      dispatch({ type: 'UPDATE_NOTEBOOK', id: showColorPicker.id, updates: { color } });
                    } else {
                      const nb = state.notebooks.find(n => n.sections.some(s => s.id === showColorPicker.id));
                      if (nb) dispatch({ type: 'UPDATE_SECTION', notebookId: nb.id, sectionId: showColorPicker.id, updates: { color } });
                    }
                    setShowColorPicker(null);
                  }}
                  className="w-8 h-8 rounded-lg border-2 border-white dark:border-gray-700 shadow hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function findName(state: AppState, id: string): string {
  for (const nb of state.notebooks) {
    if (nb.id === id) return nb.name;
    for (const sec of nb.sections) {
      if (sec.id === id) return sec.name;
      for (const pg of sec.pages) {
        if (pg.id === id) return pg.title;
      }
    }
  }
  return '';
}

// Search results component
function SearchResults({ state, dispatch, query }: { state: AppState; dispatch: React.Dispatch<any>; query: string }) {
  const q = query.toLowerCase();
  const results: { notebook: Notebook; section: Section; page: { id: string; title: string; content: string; updatedAt: number } }[] = [];
  
  for (const nb of state.notebooks) {
    for (const sec of nb.sections) {
      for (const pg of sec.pages) {
        if (pg.title.toLowerCase().includes(q) || pg.content.toLowerCase().includes(q)) {
          results.push({ notebook: nb, section: sec, page: pg });
        }
      }
    }
  }

  if (results.length === 0) {
    return <div className="p-4 text-center text-sm text-gray-400">No results found</div>;
  }

  return (
    <div className="space-y-1">
      <div className="px-2 py-1 text-[10px] text-gray-400 uppercase">{results.length} result{results.length !== 1 ? 's' : ''}</div>
      {results.map(({ notebook, section, page }) => (
        <button
          key={page.id}
          onClick={() => {
            dispatch({ type: 'SET_ACTIVE_NOTEBOOK', id: notebook.id });
            dispatch({ type: 'SET_ACTIVE_SECTION', id: section.id });
            dispatch({ type: 'SET_ACTIVE_PAGE', id: page.id });
          }}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
        >
          <div className="text-[10px] text-gray-400">{notebook.name} › {section.name}</div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{page.title}</div>
          <div className="text-[10px] text-gray-400 truncate">{page.content.replace(/[#*`>\-\[\]]/g, '').slice(0, 60)}</div>
        </button>
      ))}
    </div>
  );
}
