import { useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import { useStore } from './store/useStore';

export default function App() {
  const { state, dispatch, activeNotebook, activeSection, activePage } = useStore();
  const editorRef = useRef<HTMLTextAreaElement>(null);

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
          const ta = editorRef.current;
          if (ta && activePage) {
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const content = activePage.content;
            const selected = content.substring(start, end);
            const newContent = content.substring(0, start) + `**${selected || 'bold'}**` + content.substring(end);
            updateContent(newContent);
          }
        }
      }
      if (ctrl && e.key === 'i') {
        if (document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          const ta = editorRef.current;
          if (ta && activePage) {
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const content = activePage.content;
            const selected = content.substring(start, end);
            const newContent = content.substring(0, start) + `*${selected || 'italic'}*` + content.substring(end);
            updateContent(newContent);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeNotebook, activeSection, activePage, dispatch, updateContent]);

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${state.isDark ? 'dark' : ''}`}>
      <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Lite Word Notes</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_DARK' })}
              className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
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

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            state={state}
            dispatch={dispatch}
            activeNotebook={activeNotebook}
            activeSection={activeSection}
          />
          <Editor
            activePage={activePage}
            activeSection={activeSection}
            activeNotebook={activeNotebook}
            onUpdateContent={updateContent}
            onUpdateTitle={updateTitle}
            editorRef={editorRef}
          />
        </div>

        {/* Status bar */}
        <div className="px-4 py-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/50 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between flex-shrink-0">
          <span>{state.autoSaveStatus === 'saved' ? '✓ Saved' : state.autoSaveStatus === 'saving' ? 'Saving...' : 'Ready'}</span>
          {activePage && (
            <span>{activePage.content.split(/\s+/).filter(Boolean).length} words</span>
          )}
        </div>
      </div>
    </div>
  );
}
