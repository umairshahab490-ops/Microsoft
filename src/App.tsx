import { useCallback, useEffect, useRef } from 'react';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import { ExportModal, TemplatesModal, SettingsModal, ShortcutsModal, CommandPalette, CheatsheetModal, StatsModal, VersionsModal, EmojiPickerModal, QuickNoteModal, PomodoroModal, TOCModal } from './components/Modals';
import { useStore } from './store/useStore';
import { insertMarkdownSyntax, importMarkdownFile, replaceInText } from './utils';
import { Folder, SortBy, SortDir } from './types';

export default function App() {
  const { state, dispatch, activeNote, filteredNotes, allTags } = useStore();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggle = (modal: string) => dispatch({ type: 'TOGGLE_MODAL', modal });

  const createNote = useCallback(() => dispatch({ type: 'CREATE_NOTE' }), [dispatch]);
  const deleteNote = useCallback((id: string) => dispatch({ type: 'TRASH_NOTE', id }), [dispatch]);
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
    const newContent = replaceInText(activeNote.content, state.findQuery, state.replaceQuery, state.findCaseSensitive, state.findRegex, all);
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

  const handleRestoreData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          dispatch({ type: 'RESTORE_DATA', data });
        } catch { alert('Invalid backup file'); }
      };
      reader.readAsText(file);
    };
    input.click();
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
    dispatch({ type: 'UPDATE_NOTE', id: activeNote.id, updates: { tags: [...activeNote.tags, tag] } });
  }, [activeNote, dispatch]);

  const removeTag = useCallback((tag: string) => {
    if (!activeNote) return;
    dispatch({ type: 'UPDATE_NOTE', id: activeNote.id, updates: { tags: activeNote.tags.filter(t => t !== tag) } });
  }, [activeNote, dispatch]);

  const createFolder = useCallback((name: string) => {
    const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];
    const icons = ['📁', '📂', '🗂️', '📋', '📌', '🎯'];
    const idx = state.folders.length % colors.length;
    dispatch({ type: 'CREATE_FOLDER', folder: { id: Date.now().toString(36), name, color: colors[idx], icon: icons[idx] } });
  }, [state.folders, dispatch]);

  const navigateNotes = useCallback((dir: number) => {
    const idx = filteredNotes.findIndex(n => n.id === state.activeNoteId);
    if (idx === -1) return;
    const newIdx = idx + dir;
    if (newIdx >= 0 && newIdx < filteredNotes.length) {
      dispatch({ type: 'SET_ACTIVE_NOTE', id: filteredNotes[newIdx].id });
    }
  }, [filteredNotes, state.activeNoteId, dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      if (e.key === 'Escape') {
        if (state.isFullscreen) dispatch({ type: 'TOGGLE_FULLSCREEN' });
        else if (state.showCommandPalette) toggle('CommandPalette');
        else if (state.showSettings) toggle('Settings');
        else if (state.showShortcuts) toggle('Shortcuts');
        else if (state.showExport) toggle('Export');
        else if (state.showTemplates) toggle('Templates');
        else if (state.showFindReplace) toggle('FindReplace');
        else if (state.showCheatsheet) toggle('Cheatsheet');
        else if (state.showStats) toggle('Stats');
        else if (state.showVersions) toggle('Versions');
        else if (state.showEmojiPicker) toggle('EmojiPicker');
        else if (state.showQuickNote) toggle('QuickNote');
        else if (state.showPomodoro) toggle('Pomodoro');
        else if (state.showTOC) toggle('TOC');
        else if (state.isFocusMode) dispatch({ type: 'TOGGLE_FOCUS_MODE' });
        return;
      }

      if (!ctrl) return;

      if (e.key === 'n' && !shift) { e.preventDefault(); createNote(); }
      else if (e.key === 'p' && !shift) { e.preventDefault(); if (activeNote) togglePreview(); }
      else if (e.key === 'f' && !shift) { e.preventDefault(); document.getElementById('search-input')?.focus(); }
      else if (e.key === 'h') { e.preventDefault(); toggle('FindReplace'); }
      else if (e.key === 'k') { e.preventDefault(); toggle('CommandPalette'); }
      else if (e.key === 'd' && !shift) { e.preventDefault(); if (activeNote) deleteNote(activeNote.id); }
      else if (e.key === 'D' && shift) { e.preventDefault(); if (activeNote) duplicateNote(activeNote.id); }
      else if (e.key === 'e') { e.preventDefault(); toggle('Export'); }
      else if (e.key === '\\') { e.preventDefault(); toggleSidebar(); }
      else if (e.key === 'F' && shift) { e.preventDefault(); toggleFullscreen(); }
      else if (e.key === 'S' && shift) { e.preventDefault(); dispatch({ type: 'TOGGLE_SPLIT_VIEW' }); }
      else if (e.key === 'T' && shift) { e.preventDefault(); dispatch({ type: 'TOGGLE_FOCUS_MODE' }); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); navigateNotes(-1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); navigateNotes(1); }
      else if (e.key === 'z' && !shift) { e.preventDefault(); undo(); }
      else if (e.key === 'y') { e.preventDefault(); redo(); }
      else if (e.key === 'b' && !shift && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); insertMarkdown('bold'); }
      else if (e.key === 'i' && !shift && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); insertMarkdown('italic'); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state, activeNote, createNote, togglePreview, toggleSidebar, toggleFullscreen, deleteNote, duplicateNote, navigateNotes, undo, redo, insertMarkdown, dispatch]);

  // Command palette handler
  const executeCommand = useCallback((cmd: string) => {
    toggle('CommandPalette');
    switch (cmd) {
      case 'new': createNote(); break;
      case 'preview': togglePreview(); break;
      case 'split': dispatch({ type: 'TOGGLE_SPLIT_VIEW' }); break;
      case 'focus': dispatch({ type: 'TOGGLE_FOCUS_MODE' }); break;
      case 'fullscreen': toggleFullscreen(); break;
      case 'dark': dispatch({ type: 'TOGGLE_DARK' }); break;
      case 'export': toggle('Export'); break;
      case 'templates': toggle('Templates'); break;
      case 'settings': toggle('Settings'); break;
      case 'shortcuts': toggle('Shortcuts'); break;
      case 'cheatsheet': toggle('Cheatsheet'); break;
      case 'stats': toggle('Stats'); break;
      case 'versions': toggle('Versions'); break;
      case 'pomodoro': toggle('Pomodoro'); break;
      case 'toc': toggle('TOC'); break;
      case 'backup': dispatch({ type: 'BACKUP_DATA' }); break;
      case 'restore': handleRestoreData(); break;
      case 'sidebar': toggleSidebar(); break;
      case 'find': toggle('FindReplace'); break;
    }
  }, [createNote, togglePreview, toggleFullscreen, toggleSidebar, dispatch, handleRestoreData]);

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${state.isDark ? 'dark' : ''}`}>
      <div className="h-full flex flex-col bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100">
        {!state.isFocusMode && !state.isFullscreen && (
          <Toolbar
            state={state}
            hasActiveNote={!!activeNote}
            onTogglePreview={togglePreview}
            onToggleFullscreen={toggleFullscreen}
            onToggleSidebar={toggleSidebar}
            onToggleSplitView={() => dispatch({ type: 'TOGGLE_SPLIT_VIEW' })}
            onToggleFocusMode={() => dispatch({ type: 'TOGGLE_FOCUS_MODE' })}
            onNewNote={createNote}
            onDeleteNote={() => { if (activeNote) deleteNote(activeNote.id); }}
            onInsertMarkdown={insertMarkdown}
            onUndo={undo}
            onRedo={redo}
            onFontSizeChange={(s) => dispatch({ type: 'SET_FONT_SIZE', size: s })}
            onFontFamilyChange={(f) => dispatch({ type: 'SET_FONT_FAMILY', family: f })}
            onToggle={toggle}
            onImport={handleImport}
          />
        )}

        <div className="flex-1 flex overflow-hidden">
          {!state.isFocusMode && !state.isFullscreen && (
            <Sidebar
              notes={filteredNotes}
              trash={state.trash}
              folders={state.folders}
              allTags={allTags}
              state={state}
              onToggle={toggleSidebar}
              onSearchChange={(q) => dispatch({ type: 'SET_SEARCH', query: q })}
              onSelectNote={(id) => dispatch({ type: 'SET_ACTIVE_NOTE', id })}
              onSelectFolder={(id) => dispatch({ type: 'SET_ACTIVE_FOLDER', id })}
              onSelectTag={(tag) => dispatch({ type: 'SET_ACTIVE_TAG', tag })}
              onToggleFavorites={() => dispatch({ type: 'TOGGLE_FAVORITES' })}
              onToggleArchived={() => dispatch({ type: 'TOGGLE_ARCHIVED' })}
              onToggleTrash={() => dispatch({ type: 'TOGGLE_TRASH_VIEW' })}
              onSortChange={(by: SortBy, dir: SortDir) => dispatch({ type: 'SET_SORT', by, dir })}
              onCreateFolder={createFolder}
              onDeleteFolder={(id) => dispatch({ type: 'DELETE_FOLDER', id })}
              onTogglePin={togglePin}
              onToggleFavorite={toggleFavorite}
              onDeleteNote={deleteNote}
              onDuplicateNote={duplicateNote}
              onRestoreNote={(id) => dispatch({ type: 'RESTORE_NOTE', id })}
              onEmptyTrash={() => dispatch({ type: 'EMPTY_TRASH' })}
              onToggleSelect={(id) => dispatch({ type: 'TOGGLE_SELECT', id })}
              onSelectAll={() => dispatch({ type: 'SELECT_ALL' })}
              onClearSelection={() => dispatch({ type: 'CLEAR_SELECTION' })}
              onBulkDelete={() => dispatch({ type: 'BULK_DELETE' })}
              onBulkArchive={() => dispatch({ type: 'BULK_ARCHIVE' })}
              onBulkTag={(tag) => dispatch({ type: 'BULK_TAG', tag })}
            />
          )}

          {activeNote ? (
            <Editor
              note={activeNote}
              state={state}
              onContentChange={updateContent}
              onTitleChange={updateTitle}
              onPushUndo={pushUndo}
              onSetFindQuery={(q) => dispatch({ type: 'SET_FIND_QUERY', query: q })}
              onSetReplaceQuery={(q) => dispatch({ type: 'SET_REPLACE_QUERY', query: q })}
              onToggleFindCase={() => dispatch({ type: 'TOGGLE_FIND_CASE' })}
              onToggleFindRegex={() => dispatch({ type: 'TOGGLE_FIND_REGEX' })}
              onReplace={handleReplace}
              onCloseFindReplace={() => toggle('FindReplace')}
              editorRef={editorRef}
              onTagAdd={addTag}
              onTagRemove={removeTag}
              onToggle={toggle}
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

        {state.isFullscreen && (
          <div className="absolute top-2 right-2 z-50">
            <button onClick={toggleFullscreen} className="px-3 py-1 bg-black/50 text-white text-xs rounded-full hover:bg-black/70">
              Press Esc to exit
            </button>
          </div>
        )}

        {state.isFocusMode && (
          <div className="absolute top-2 right-2 z-50">
            <button onClick={() => dispatch({ type: 'TOGGLE_FOCUS_MODE' })} className="px-3 py-1 bg-black/50 text-white text-xs rounded-full hover:bg-black/70">
              Press Esc to exit focus mode
            </button>
          </div>
        )}

        <div className={`fixed bottom-4 right-4 z-50 px-2 py-1 rounded text-[10px] transition-all duration-300 ${
          state.autoSaveStatus === 'saved' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${state.autoSaveStatus === 'saving' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
          {state.autoSaveStatus === 'saving' ? '⏳ Saving...' : '✓ Saved'}
        </div>
      </div>

      {/* Modals */}
      <ExportModal isOpen={state.showExport} onClose={() => toggle('Export')} note={activeNote} allNotes={state.notes} />
      <TemplatesModal isOpen={state.showTemplates} onClose={() => toggle('Templates')} onApply={(t) => dispatch({ type: 'APPLY_TEMPLATE', template: t })} />
      <SettingsModal isOpen={state.showSettings} onClose={() => toggle('Settings')} state={state} dispatch={dispatch} />
      <ShortcutsModal isOpen={state.showShortcuts} onClose={() => toggle('Shortcuts')} />
      <CommandPalette isOpen={state.showCommandPalette} onClose={() => toggle('CommandPalette')} query={state.commandQuery} onQueryChange={(q) => dispatch({ type: 'SET_COMMAND_QUERY', query: q })} onExecute={executeCommand} />
      <CheatsheetModal isOpen={state.showCheatsheet} onClose={() => toggle('Cheatsheet')} />
      <StatsModal isOpen={state.showStats} onClose={() => toggle('Stats')} notes={state.notes} />
      <VersionsModal isOpen={state.showVersions} onClose={() => toggle('Versions')} note={activeNote} onSave={(label) => activeNote && dispatch({ type: 'SAVE_VERSION', id: activeNote.id, label })} onRestore={(vid) => activeNote && dispatch({ type: 'RESTORE_VERSION', noteId: activeNote.id, versionId: vid })} />
      <EmojiPickerModal isOpen={state.showEmojiPicker} onClose={() => toggle('EmojiPicker')} onSelect={(emoji) => { if (activeNote) { dispatch({ type: 'UPDATE_NOTE', id: activeNote.id, updates: { content: activeNote.content + emoji } }); } toggle('EmojiPicker'); }} />
      <QuickNoteModal isOpen={state.showQuickNote} onClose={() => toggle('QuickNote')} onSave={(title, content) => { dispatch({ type: 'CREATE_NOTE' }); setTimeout(() => { if (activeNote) { dispatch({ type: 'UPDATE_NOTE', id: activeNote.id, updates: { title, content } }); } }, 50); }} />
      <PomodoroModal isOpen={state.showPomodoro} onClose={() => toggle('Pomodoro')} state={state} dispatch={dispatch} />
      <TOCModal isOpen={state.showTOC} onClose={() => toggle('TOC')} content={activeNote?.content || ''} editorRef={editorRef} />
    </div>
  );
}
