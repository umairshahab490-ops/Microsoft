import { marked } from 'marked';
import { Notebook, Section, Page } from '../types';
import { formatDate } from '../utils';
import { useMemo } from 'react';

interface EditorProps {
  activePage?: Page;
  activeSection?: Section;
  activeNotebook?: Notebook;
  onUpdateContent: (content: string) => void;
  onUpdateTitle: (title: string) => void;
  editorRef: React.RefObject<HTMLTextAreaElement>;
}

export default function Editor({ activePage, activeSection, activeNotebook, onUpdateContent, onUpdateTitle, editorRef }: EditorProps) {
  const renderedHtml = useMemo(() => {
    if (!activePage?.content) return '';
    return marked.parse(activePage.content) as string;
  }, [activePage?.content]);

  if (!activePage || !activeSection || !activeNotebook) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">Select a page to start editing</h2>
          <p className="text-sm text-gray-400">Or create a new page from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-6 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 flex-shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: activeNotebook.color }} />
          <span>{activeNotebook.name}</span>
          <span>›</span>
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: activeSection.color }} />
          <span>{activeSection.name}</span>
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pt-6 pb-2 flex-shrink-0">
        <input
          type="text"
          value={activePage.title}
          onChange={e => onUpdateTitle(e.target.value)}
          placeholder="Page title..."
          className="w-full text-2xl font-light text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none bg-transparent"
        />
        <div className="text-xs text-gray-400 mt-1">
          Edited {formatDate(activePage.updatedAt)}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <textarea
          ref={editorRef}
          value={activePage.content}
          onChange={e => onUpdateContent(e.target.value)}
          placeholder="Start writing... (Markdown supported)"
          className="w-full h-full min-h-[400px] text-sm text-gray-800 dark:text-gray-200 leading-relaxed resize-none focus:outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-600 font-sans"
          style={{ lineHeight: '1.7' }}
          spellCheck
        />
      </div>

      {/* Preview (toggle with button) */}
      {activePage.content && (
        <details className="mx-6 mb-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50">
          <summary className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-white/30 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
            📖 Preview rendered markdown
          </summary>
          <div
            className="px-4 pb-4 prose prose-sm dark:prose-invert max-w-none markdown-preview"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </details>
      )}
    </div>
  );
}
