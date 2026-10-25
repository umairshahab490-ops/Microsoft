import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { renderMarkdown, getStats, findInText } from '../utils';
import { Note } from '../types';
import { X, ChevronUp, ChevronDown, Replace } from 'lucide-react';

interface EditorProps {
  note: Note;
  isPreview: boolean;
  fontSize: number;
  fontFamily: string;
  showLineNumbers: boolean;
  wordWrap: boolean;
  showFindReplace: boolean;
  findQuery: string;
  replaceQuery: string;
  findCaseSensitive: boolean;
  findRegex: boolean;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onPushUndo: (content: string) => void;
  onSetFindQuery: (q: string) => void;
  onSetReplaceQuery: (q: string) => void;
  onToggleFindCase: () => void;
  onToggleFindRegex: () => void;
  onReplace: (all: boolean) => void;
  onCloseFindReplace: () => void;
  editorRef: React.RefObject<HTMLTextAreaElement>;
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
}

const Editor: React.FC<EditorProps> = ({
  note, isPreview, fontSize, fontFamily, showLineNumbers, wordWrap,
  showFindReplace, findQuery, replaceQuery, findCaseSensitive, findRegex,
  onContentChange, onTitleChange, onPushUndo, onSetFindQuery, onSetReplaceQuery,
  onToggleFindCase, onToggleFindRegex, onReplace, onCloseFindReplace,
  editorRef, onTagAdd, onTagRemove,
}) => {
  const [newTag, setNewTag] = React.useState('');
  const [findIndex, setFindIndex] = React.useState(0);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => getStats(note.content), [note.content]);
  const renderedHtml = useMemo(() => isPreview ? renderMarkdown(note.content) : '', [isPreview, note.content]);

  const findMatches = useMemo(() => {
    if (!findQuery || isPreview) return [];
    return findInText(note.content, findQuery, findCaseSensitive, findRegex);
  }, [note.content, findQuery, findCaseSensitive, findRegex, isPreview]);

  // Sync line numbers scroll with editor
  const handleEditorScroll = useCallback(() => {
    if (lineNumbersRef.current && editorRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
  }, [editorRef]);

  // Navigate find matches
  const navigateFind = useCallback((dir: number) => {
    if (findMatches.length === 0) return;
    const newIndex = (findIndex + dir + findMatches.length) % findMatches.length;
    setFindIndex(newIndex);
    const match = findMatches[newIndex];
    if (editorRef.current && match) {
      editorRef.current.focus();
      editorRef.current.setSelectionRange(match.start, match.end);
      // Scroll into view
      const text = note.content.substring(0, match.start);
      const lineNum = text.split('\n').length;
      const lineHeight = fontSize * 1.6;
      editorRef.current.scrollTop = (lineNum - 3) * lineHeight;
    }
  }, [findMatches, findIndex, editorRef, note.content, fontSize]);

  // Handle content change with undo tracking
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    // Push undo on significant changes (debounced in parent)
    onPushUndo(note.content);
    onContentChange(newContent);
  }, [note.content, onContentChange, onPushUndo]);

  // Handle key events in editor (Tab support)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = note.content;

      if (e.shiftKey) {
        // Outdent
        const lineStart = content.lastIndexOf('\n', start - 1) + 1;
        const lineContent = content.substring(lineStart, start);
        if (lineContent.startsWith('  ')) {
          const newContent = content.substring(0, lineStart) + content.substring(lineStart).replace(/^ {1,2}/, '');
          onPushUndo(content);
          onContentChange(newContent);
          requestAnimationFrame(() => {
            textarea.setSelectionRange(Math.max(lineStart, start - 2), Math.max(lineStart, end - 2));
          });
        }
      } else {
        // Indent
        const newContent = content.substring(0, start) + '  ' + content.substring(end);
        onPushUndo(content);
        onContentChange(newContent);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(start + 2, start + 2);
        });
      }
    }
  }, [note.content, onContentChange, onPushUndo]);

  // Tag management
  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !note.tags.includes(tag)) {
      onTagAdd(tag);
      setNewTag('');
    }
  };

  // Line numbers
  const lineCount = note.content.split('\n').length;
  const lineNumbers = useMemo(() => {
    if (!showLineNumbers) return null;
    return Array.from({ length: lineCount }, (_, i) => (
      <div key={i} className="text-right pr-2 text-gray-300 dark:text-gray-600 select-none" style={{ fontSize: fontSize - 2, lineHeight: '1.6' }}>
        {i + 1}
      </div>
    ));
  }, [lineCount, showLineNumbers, fontSize]);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#1e1e1e] overflow-hidden">
      {/* Find & Replace Bar */}
      {showFindReplace && !isPreview && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-[#252525] border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-1 flex-1">
            <input
              type="text"
              value={findQuery}
              onChange={e => { onSetFindQuery(e.target.value); setFindIndex(0); }}
              placeholder="Find..."
              className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-[#333] dark:text-white w-40 focus:outline-none focus:border-[#2b579a]"
              autoFocus
            />
            <span className="text-[10px] text-gray-400 min-w-[40px]">
              {findMatches.length > 0 ? `${findIndex + 1}/${findMatches.length}` : '0 results'}
            </span>
            <button onClick={() => navigateFind(-1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Previous">
              <ChevronUp size={14} />
            </button>
            <button onClick={() => navigateFind(1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Next">
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleFindCase}
              className={`px-1.5 py-0.5 text-[10px] rounded border ${findCaseSensitive ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}
              title="Case sensitive"
            >Aa</button>
            <button
              onClick={onToggleFindRegex}
              className={`px-1.5 py-0.5 text-[10px] rounded border ${findRegex ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}
              title="Regex"
            >.*</button>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={replaceQuery}
              onChange={e => onSetReplaceQuery(e.target.value)}
              placeholder="Replace..."
              className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-[#333] dark:text-white w-32 focus:outline-none focus:border-[#2b579a]"
            />
            <button onClick={() => onReplace(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Replace">
              <Replace size={14} />
            </button>
            <button onClick={() => onReplace(true)} className="px-1.5 py-0.5 text-[10px] hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Replace All">
              All
            </button>
          </div>
          <button onClick={onCloseFindReplace} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Title + Tags */}
      <div className="px-6 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <input
          type="text"
          value={note.title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Note title..."
          className="w-full text-xl font-semibold text-gray-800 dark:text-gray-100 placeholder-gray-300 focus:outline-none bg-transparent"
          readOnly={isPreview}
        />
        {/* Tags */}
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {note.tags.map(tag => (
            <span key={tag} className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full">
              {tag}
              {!isPreview && (
                <button onClick={() => onTagRemove(tag)} className="hover:text-red-500">
                  <X size={9} />
                </button>
              )}
            </span>
          ))}
          {!isPreview && (
            <div className="flex items-center">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); }}
                placeholder="+ tag"
                className="w-14 px-1 py-0.5 text-[10px] border border-dashed border-gray-200 rounded focus:outline-none focus:border-[#2b579a] bg-transparent text-gray-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 overflow-hidden flex">
        {isPreview ? (
          <div
            className="flex-1 overflow-y-auto p-6 md:p-10 markdown-preview dark:dark-preview"
            style={{ fontSize, fontFamily }}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        ) : (
          <>
            {/* Line numbers */}
            {showLineNumbers && (
              <div
                ref={lineNumbersRef}
                className="overflow-hidden bg-gray-50 dark:bg-[#1a1a1a] border-r border-gray-100 dark:border-gray-700 py-4 pl-2 flex-shrink-0 select-none"
                style={{ minWidth: '3rem' }}
              >
                {lineNumbers}
              </div>
            )}
            {/* Textarea */}
            <textarea
              ref={editorRef}
              value={note.content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onScroll={handleEditorScroll}
              placeholder="Start writing... (Markdown supported)"
              className="flex-1 p-6 md:p-10 text-gray-800 dark:text-gray-200 leading-relaxed resize-none focus:outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-600"
              style={{
                fontSize,
                fontFamily,
                lineHeight: '1.6',
                whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                overflowWrap: wordWrap ? 'break-word' : 'normal',
              }}
              spellCheck={false}
            />
          </>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-1 bg-[#2b579a] text-white text-[10px] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span>{stats.words} words</span>
          <span>{stats.chars} chars</span>
          <span>{stats.lines} lines</span>
          <span>{stats.paragraphs} paragraphs</span>
          <span className="hidden sm:inline">~{stats.readTime} min read</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{fontFamily} {fontSize}px</span>
          <span className="hidden sm:inline">{showLineNumbers ? 'Ln' : ''}</span>
          <span>{wordWrap ? 'Wrap' : 'No Wrap'}</span>
        </div>
      </div>
    </div>
  );
};

export default Editor;
