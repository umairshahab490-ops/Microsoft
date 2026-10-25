import { useCallback, useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';
import { useStore } from './store/useStore';
import { insertMarkdownSyntax } from './utils';

export default function App() {
  const { state, dispatch, activeNotebook, activeSection, activePage } = useStore();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [showSettings, setShowSettings] = useState(false);

  const updateContent = useCallback((content: string) => {
    if (activeNotebook && activeSection && activePage) {
      dispatch({
        type: 'UPDATE_PAGE',
        notebookId: activeNotebook.id,
        sectionId: activeSection.id,
        pageId: activePage.id,
        updates: { content },
      });
    }
  }, [activeNotebook, activeSection, activePage, dispatch]);

  const updateTitle = useCallback((title: string) => {
    if (activeNotebook && activeSection && activePage) {
      dispatch({
        type: 'UPDATE_PAGE',
        notebookId: activeNotebook.id,
        sectionId: activeSection.id,
        pageId: activePage.id,
        updates: { title },
      });
    }
  }, [activeNotebook, activeSection, activePage, dispatch]);

  const handleInsertMarkdown = useCallback((syntax: string) => {
    const textarea = editorRef.current;
    if (!textarea || !activePage) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const { newContent, cursorPos } = insertMarkdownSyntax(
      activePage.content,
      start,
      end,
      syntax
    );
    
    updateContent(newContent);
    
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }, [activePage, updateContent]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      
      if (ctrl && e.key === 'n') {
        e.preventDefault();
        if (activeNotebook && activeSection) {
          dispatch({
            type: 'CREATE_PAGE',
            notebookId: activeNotebook.id,
            sectionId: activeSection.id,
            title: 'New Page',
          });
        }
      }
      
      if (ctrl && e.key === 'b') {
        if (document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          handleInsertMarkdown('bold');
        }
      }
      
      if (ctrl && e.key === 'i') {
        if (document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          handleInsertMarkdown('italic');
        }
      }
    };
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeNotebook, activeSection, dispatch, handleInsertMarkdown]);

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden bg-blobs ${state.isDark ? 'dark' : ''}`}>
      <div className="h-full flex flex-col relative z-10">
        {/* Top bar */}
        <div className="glass-panel flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-white/20 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              className="tap-target p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift"
              title="Toggle sidebar"
            >
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Lite Word Notes</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="tap-target p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift"
              title="Settings & Shortcuts"
            >
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_DARK' })}
              className="tap-target p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift"
              title="Toggle dark mode"
            >
              {state.isDark ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="glass-panel mx-4 mt-2 rounded-2xl p-4 flex-shrink-0 border border-white/20 dark:border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">New page</span>
                <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">Ctrl+N</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Bold</span>
                <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">Ctrl+B</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Italic</span>
                <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">Ctrl+I</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Toggle sidebar</span>
                <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">Click ☰</kbd>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            state={state}
            dispatch={dispatch}
            activeNotebook={activeNotebook}
            activeSection={activeSection}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Floating toolbar */}
            {activePage && (
              <div className="px-4 pt-3 flex-shrink-0">
                <Toolbar
                  onInsertMarkdown={handleInsertMarkdown}
                  disabled={false}
                />
              </div>
            )}
            
            {/* Editor */}
            <Editor
              activePage={activePage}
              activeSection={activeSection}
              activeNotebook={activeNotebook}
              onUpdateContent={updateContent}
              onUpdateTitle={updateTitle}
              editorRef={editorRef}
            />
          </div>
        </div>

        {/* Status bar */}
        <div className="glass-panel px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between flex-shrink-0 border-t border-white/20 dark:border-gray-700/50">
          <span>{state.autoSaveStatus === 'saved' ? '✓ Saved' : state.autoSaveStatus === 'saving' ? 'Saving...' : 'Ready'}</span>
          {activePage && (
            <span>{activePage.content.split(/\s+/).filter(Boolean).length} words</span>
          )}
        </div>
      </div>
    </div>
  );
}
