import { useCallback, useEffect, useRef } from 'react';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import { ExportModal, TemplatesModal, SettingsModal, ShortcutsModal } from './components/Modals';
import { useStore } from './store/useStore';
import { insertMarkdownSyntax, importMarkdownFile, replaceInText } from './utils';
import { Folder } from './types';

export default function App() {
  const { state, dispatch, activeNote, filteredNotes, allTags } = useStore();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Actions ────────────────────────────────────────────────
  const createNote = useCallback(() => dispatch({ type: 'CREATE_NOTE' }), [dispatch]);
  const deleteNote = useCallback((id: string) => dispatch({ type: 'DELETE_NOTE', id }), [dispatch]);
  const duplicateNote = useCallback((id: string) => dispatch({ type: 'DUPLICATE_NOTE', id }), [dispatch]);
  const togglePreview = useCallback(() => dispatch({ type: 'TOGGLE_PREVIEW' }), [dispatch]);
  const toggleFullscreen = useCallback(() => dispatch({ type: 'TOGGLE_FULLSCREEN' }), [dispatch]);
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), [dispatch]);

  const updateContent = useCallback((content: string) => {
    if (activeNote) dispatch({ type: 'UPDATE_NOTE', id: activeNote.id, updates: { content } });
  }, [activeNote, dispatch]);

  const updateTitle = useCallback((title: string) => {
    if (activeNote) dispatch({ type: 'UPDATE_NOTE', id: activeNote.id, updates: { title } });
  }, [activeNote, dispatch]);

  const pushUndo = useCallback((content: string) => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => {
      dispatch({ type: 'PUSH_UNDO', content });
    }, 500);
  }, [dispatch]);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [dispatch]);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [dispatch]);

  const insertMarkdown = useCallback((syntax: string) => {
    const textarea = editorRef.current;
    if (!textarea || !activeNote) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const { newContent, cursorPos } = insertMarkdownSyntax(activeNote.content, start, end, syntax);
    dispatch({ type: 'PUSH_UNDO', content: activeNote.content });
    dispatch({ type: 'UPDATE_NOTE', id: activeNote.id, updates: { content: newContent } });
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }, [activeNote, dispatch]);

  const handleReplace = useCallback((all: boolean) => {
    if (!activeNote) return;
    const newContent = replaceInText(
      activeNote.content, state.findQuery, state.replaceQuery,
      state.findCaseSensitive, state.findRegex, all
    );
    dispatch({ type: 'PUSH_UNDO', content: activeNote.content });
    dispatch({ type: 'UPDATE_NOTE', id: activeNote.id, updates: { content: newContent } });
  }, [activeNote, state.findQuery, state.findCaseSensitive, state.findRegex, state.replaceQuery, dispatch]);

  const handleImport = useCallback(async () => {
    const notes = await importMarkdownFile();
    if (notes.length > 0) {
      dispatch({ type: 'IMPORT_NOTES', notes });
      dispatch({ type: 'SET_ACTIVE_NOTE', id: notes[0].id });
    }
  }, [dispatch]);

  const togglePin = useCallback((id: string) => {
    const note = state.notes.find(n => n.id === id);
    if (note) dispatch({ type: 'UPDATE_NOTE', id, updates: { pinned: !note.pinned } });
  }, [state.notes, dispatch]);

  const toggleFavorite = useCallback((id: string) => {
    const note = state.notes.find(n => n.id === id);
    if (note) dispatch({ type: 'UPDATE_NOTE', id, updates: { favorite: !note.favorite } });
  }, [state.notes, dispatch]);

  const addTag = useCallback((tag: string) => {
    if (!activeNote) return;
    const tags = [...activeNote.tags, tag];
    dispatch({ type: 'UPDATE_NOTE', id: activeNote.id, updates: { tags } });
  }, [activeNote, dispatch]);

  const removeTag = useCallback((tag: string) => {
    if (!activeNote) return;
    const tags = activeNote.tags.filter(t => t !== tag);
    dispatch({ type: 'UPDATE_NOTE', id: activeNote.id, updates: { tags } });
  }, [activeNote, dispatch]);

  const createFolder = useCallback((name: string) => {
    const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];
    const icons = ['📁', '📂', '🗂️', '📋', '📌', '🎯'];
    const idx = state.folders.length % colors.length;
    const folder: Folder = {
      id: Date.now().toString(36),
      name,
      color: colors[idx],
      icon: icons[idx],
    };
    dispatch({ type: 'CREATE_FOLDER', folder });
  }, [state.folders, dispatch]);

  const deleteFolder = useCallback((id: string) => dispatch({ type: 'DELETE_FOLDER', id }), [dispatch]);

  const navigateNotes = useCallback((dir: number) => {
    const idx = filteredNotes.findIndex(n => n.id === state.activeNoteId);
    if (idx === -1) return;
    const newIdx = idx + dir;
    if (newIdx >= 0 && newIdx < filteredNotes.length) {
      dispatch({ type: 'SET_ACTIVE_NOTE', id: filteredNotes[newIdx].id });
    }
  }, [filteredNotes, state.activeNoteId, dispatch]);

  // ── Keyboard Shortcuts ─────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Escape
      if (e.key === 'Escape') {
        if (state.isFullscreen) { dispatch({ type: 'TOGGLE_FULLSCREEN' }); return; }
        if (state.showSettings) { dispatch({ type: 'TOGGLE_SETTINGS' }); return; }
        if (state.showShortcuts) { dispatch({ type: 'TOGGLE_SHORTCUTS' }); return; }
        if (state.showExport) { dispatch({ type: 'TOGGLE_EXPORT' }); return; }
        if (state.showTemplates) { dispatch({ type: 'TOGGLE_TEMPLATES' }); return; }
        if (state.showFindReplace) { dispatch({ type: 'TOGGLE_FIND_REPLACE' }); return; }
        return;
      }

      if (!ctrl) return;

      if (e.key === 'n' && !shift) { e.preventDefault(); createNote(); }
      else if (e.key === 'p' && !shift) { e.preventDefault(); if (activeNote) togglePreview(); }
      else if (e.key === 'f' && !shift) { e.preventDefault(); document.getElementById('search-input')?.focus(); }
      else if (e.key === 'h') { e.preventDefault(); dispatch({ type: 'TOGGLE_FIND_REPLACE' }); }
      else if (e.key === 'd' && !shift) { e.preventDefault(); if (activeNote) deleteNote(activeNote.id); }
      else if (e.key === 'd' && shift) { e.preventDefault(); if (activeNote) duplicateNote(activeNote.id); }
      else if (e.key === 'e') { e.preventDefault(); dispatch({ type: 'TOGGLE_EXPORT' }); }
      else if (e.key === '\\') { e.preventDefault(); toggleSidebar(); }
      else if (e.key === 'F' && shift) { e.preventDefault(); toggleFullscreen(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); navigateNotes(-1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); navigateNotes(1); }
      else if (e.key === 'z' && !shift) { e.preventDefault(); undo(); }
      else if (e.key === 'y') { e.preventDefault(); redo(); }
      else if (e.key === 'b' && !shift) {
        if (document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault(); insertMarkdown('bold');
        }
      }
      else if (e.key === 'i' && !shift) {
        if (document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault(); insertMarkdown('italic');
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state.isFullscreen, state.showSettings, state.showShortcuts, state.showExport, state.showTemplates, state.showFindReplace, activeNote, createNote, togglePreview, toggleSidebar, toggleFullscreen, deleteNote, duplicateNote, navigateNotes, undo, redo, insertMarkdown, dispatch]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${state.isDark ? 'dark' : ''}`}>
      <div className="h-full flex flex-col bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100">
        {/* Toolbar */}
        {!state.isFullscreen && (
          <Toolbar
            isPreview={state.isPreview}
            isFullscreen={state.isFullscreen}
            sidebarOpen={state.sidebarOpen}
            hasActiveNote={!!activeNote}
            fontSize={state.fontSize}
            fontFamily={state.fontFamily}
            onTogglePreview={togglePreview}
            onToggleFullscreen={toggleFullscreen}
            onToggleSidebar={toggleSidebar}
            onNewNote={createNote}
            onDeleteNote={() => activeNote && deleteNote(activeNote.id)}
            onInsertMarkdown={insertMarkdown}
            onUndo={undo}
            onRedo={redo}
            onFontSizeChange={(s) => dispatch({ type: 'SET_FONT_SIZE', size: s })}
            onFontFamilyChange={(f) => dispatch({ type: 'SET_FONT_FAMILY', family: f })}
            onToggleFindReplace={() => dispatch({ type: 'TOGGLE_FIND_REPLACE' })}
            onToggleExport={() => dispatch({ type: 'TOGGLE_EXPORT' })}
            onToggleSettings={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
            onToggleShortcuts={() => dispatch({ type: 'TOGGLE_SHORTCUTS' })}
            onToggleTemplates={() => dispatch({ type: 'TOGGLE_TEMPLATES' })}
            onImport={handleImport}
          />
        )}

        {/* Main */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          {!state.isFullscreen && (
            <Sidebar
              notes={filteredNotes}
              folders={state.folders}
              allTags={allTags}
              activeId={state.activeNoteId}
              activeFolderId={state.activeFolderId}
              activeTag={state.activeTag}
              showFavorites={state.showFavorites}
              searchQuery={state.searchQuery}
              sortBy={state.sortBy}
              sortDir={state.sortDir}
              isOpen={state.sidebarOpen}
              onToggle={toggleSidebar}
              onSearchChange={(q) => dispatch({ type: 'SET_SEARCH', query: q })}
              onSelectNote={(id) => dispatch({ type: 'SET_ACTIVE_NOTE', id })}
              onSelectFolder={(id) => dispatch({ type: 'SET_ACTIVE_FOLDER', id })}
              onSelectTag={(tag) => dispatch({ type: 'SET_ACTIVE_TAG', tag })}
              onToggleFavorites={() => dispatch({ type: 'TOGGLE_FAVORITES' })}
              onSortChange={(by, dir) => dispatch({ type: 'SET_SORT', by: by as any, dir: dir as any })}
              onCreateFolder={createFolder}
              onDeleteFolder={deleteFolder}
              onTogglePin={togglePin}
              onToggleFavorite={toggleFavorite}
              onDeleteNote={deleteNote}
              onDuplicateNote={duplicateNote}
            />
          )}

          {/* Editor */}
          {activeNote ? (
            <Editor
              note={activeNote}
              isPreview={state.isPreview}
              fontSize={state.fontSize}
              fontFamily={state.fontFamily}
              showLineNumbers={state.showLineNumbers}
              wordWrap={state.wordWrap}
              showFindReplace={state.showFindReplace}
              findQuery={state.findQuery}
              replaceQuery={state.replaceQuery}
              findCaseSensitive={state.findCaseSensitive}
              findRegex={state.findRegex}
              onContentChange={updateContent}
              onTitleChange={updateTitle}
              onPushUndo={pushUndo}
              onSetFindQuery={(q) => dispatch({ type: 'SET_FIND_QUERY', query: q })}
              onSetReplaceQuery={(q) => dispatch({ type: 'SET_REPLACE_QUERY', query: q })}
              onToggleFindCase={() => dispatch({ type: 'TOGGLE_FIND_CASE' })}
              onToggleFindRegex={() => dispatch({ type: 'TOGGLE_FIND_REGEX' })}
              onReplace={handleReplace}
              onCloseFindReplace={() => dispatch({ type: 'TOGGLE_FIND_REPLACE' })}
              editorRef={editorRef}
              onTagAdd={addTag}
              onTagRemove={removeTag}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#1e1e1e]">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📝</span>
                </div>
                <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No note selected</h2>
                <p className="text-sm text-gray-400 mb-4">Create a new note or select one from the sidebar</p>
                <button onClick={createNote} className="px-5 py-2 bg-[#2b579a] text-white text-sm rounded hover:bg-[#1e3f6f] transition-colors shadow">
                  New Note (Ctrl+N)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen exit bar */}
        {state.isFullscreen && (
          <div className="absolute top-2 right-2 z-50">
            <button onClick={toggleFullscreen} className="px-3 py-1 bg-black/50 text-white text-xs rounded-full hover:bg-black/70 transition-colors">
              Press Esc to exit fullscreen
            </button>
          </div>
        )}

        {/* Auto-save indicator */}
        <div className={`fixed bottom-4 right-4 z-50 px-2 py-1 rounded text-[10px] transition-all duration-300 ${
          state.autoSaveStatus === 'saved' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${state.autoSaveStatus === 'saving' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
          {state.autoSaveStatus === 'saving' ? '⏳ Saving...' : '✓ Saved'}
        </div>
      </div>

      {/* Modals */}
      <ExportModal isOpen={state.showExport} onClose={() => dispatch({ type: 'TOGGLE_EXPORT' })} note={activeNote} allNotes={state.notes} />
      <TemplatesModal isOpen={state.showTemplates} onClose={() => dispatch({ type: 'TOGGLE_TEMPLATES' })} onApply={(t) => dispatch({ type: 'APPLY_TEMPLATE', template: t })} />
      <SettingsModal
        isOpen={state.showSettings} onClose={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
        isDark={state.isDark} onToggleDark={() => dispatch({ type: 'TOGGLE_DARK' })}
        fontSize={state.fontSize} onFontSizeChange={(s) => dispatch({ type: 'SET_FONT_SIZE', size: s })}
        fontFamily={state.fontFamily} onFontFamilyChange={(f) => dispatch({ type: 'SET_FONT_FAMILY', family: f })}
        showLineNumbers={state.showLineNumbers} onToggleLineNumbers={() => dispatch({ type: 'TOGGLE_LINE_NUMBERS' })}
        wordWrap={state.wordWrap} onToggleWordWrap={() => dispatch({ type: 'TOGGLE_WORD_WRAP' })}
      />
      <ShortcutsModal isOpen={state.showShortcuts} onClose={() => dispatch({ type: 'TOGGLE_SHORTCUTS' })} />
    </div>
  );
}
