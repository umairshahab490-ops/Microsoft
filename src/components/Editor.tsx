import React, { useRef, useCallback, useMemo, useState } from 'react';
import { renderMarkdown, getStats, findInText } from '../utils';
import { Note, AppState } from '../types';
import { X, ChevronUp, ChevronDown, Replace } from 'lucide-react';

interface EditorProps {
  note: Note;
  state: AppState;
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
  onToggle: (modal: string) => void;
}

const Editor: React.FC<EditorProps> = ({
  note, state, onContentChange, onTitleChange, onPushUndo, onSetFindQuery, onSetReplaceQuery,
  onToggleFindCase, onToggleFindRegex, onReplace, onCloseFindReplace, editorRef, onTagAdd, onTagRemove, onToggle,
}) => {
  const [newTag, setNewTag] = useState('');
  const [findIndex, setFindIndex] = useState(0);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => getStats(note.content), [note.content]);
  const renderedHtml = useMemo(() => (state.isPreview || state.isSplitView) ? renderMarkdown(note.content) : '', [state.isPreview, state.isSplitView, note.content]);

  const findMatches = useMemo(() => {
    if (!state.findQuery || state.isPreview) return [];
    return findInText(note.content, state.findQuery, state.findCaseSensitive, state.findRegex);
  }, [note.content, state.findQuery, state.findCaseSensitive, state.findRegex, state.isPreview]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPushUndo(note.content);
    onContentChange(e.target.value);
  }, [note.content, onContentChange, onPushUndo]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const content = note.content;
      if (e.shiftKey) {
        const lineStart = content.lastIndexOf('\n', start - 1) + 1;
        if (content.substring(lineStart, start).startsWith('  ')) {
          const newContent = content.substring(0, lineStart) + content.substring(lineStart).replace(/^ {1,2}/, '');
          onPushUndo(content);
          onContentChange(newContent);
          requestAnimationFrame(() => ta.setSelectionRange(Math.max(lineStart, start - 2), Math.max(lineStart, end - 2)));
        }
      } else {
        const newContent = content.substring(0, start) + '  ' + content.substring(end);
        onPushUndo(content);
        onContentChange(newContent);
        requestAnimationFrame(() => ta.setSelectionRange(start + 2, start + 2));
      }
    }
  }, [note.content, onContentChange, onPushUndo]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        if (!blob) return;
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const md = `\n![pasted image](${dataUrl})\n`;
          const ta = editorRef.current;
          if (ta) {
            const pos = ta.selectionStart;
            const newContent = note.content.substring(0, pos) + md + note.content.substring(pos);
            onPushUndo(note.content);
            onContentChange(newContent);
          }
        };
        reader.readAsDataURL(blob);
        return;
      }
    }
  }, [note.content, onContentChange, onPushUndo, editorRef]);

  const navigateFind = useCallback((dir: number) => {
    if (findMatches.length === 0) return;
    const newIndex = (findIndex + dir + findMatches.length) % findMatches.length;
    setFindIndex(newIndex);
    const match = findMatches[newIndex];
    if (editorRef.current && match) {
      editorRef.current.focus();
      editorRef.current.setSelectionRange(match.start, match.end);
    }
  }, [findMatches, findIndex, editorRef]);

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !note.tags.includes(tag)) { onTagAdd(tag); setNewTag(''); }
  };

  const lineCount = note.content.split('\n').length;
  const lineNumbers = useMemo(() => {
    if (!state.showLineNumbers) return null;
    return Array.from({ length: lineCount }, (_, i) => (
      <div key={i} className="text-right pr-2 text-gray-300 dark:text-gray-600 select-none" style={{ fontSize: state.fontSize - 2, lineHeight: '1.6' }}>{i + 1}</div>
    ));
  }, [lineCount, state.showLineNumbers, state.fontSize]);

  // Wiki-style link rendering
  const processedHtml = useMemo(() => {
    if (!renderedHtml) return '';
    return renderedHtml.replace(/\[\[([^\]]+)\]\]/g, '<span class="wiki-link cursor-pointer text-blue-600 underline" data-note="$1">[$1]</span>');
  }, [renderedHtml]);

  const editorContent = (
    <>
      {state.showLineNumbers && (
        <div ref={lineNumbersRef} className="overflow-hidden bg-gray-50 dark:bg-[#1a1a1a] border-r border-gray-100 dark:border-gray-700 py-4 pl-2 flex-shrink-0 select-none" style={{ minWidth: '3rem' }}>
          {lineNumbers}
        </div>
      )}
      <textarea
        ref={editorRef}
        value={note.content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="Start writing... (Markdown supported)"
        className="flex-1 p-6 md:p-10 text-gray-800 dark:text-gray-200 leading-relaxed resize-none focus:outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-600"
        style={{ fontSize: state.fontSize, fontFamily: state.fontFamily, lineHeight: '1.6', whiteSpace: state.wordWrap ? 'pre-wrap' : 'pre', overflowWrap: state.wordWrap ? 'break-word' : 'normal' }}
        spellCheck={state.spellCheck}
      />
    </>
  );

  const previewContent = (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 markdown-preview dark:dark-preview" style={{ fontSize: state.fontSize, fontFamily: state.fontFamily }} dangerouslySetInnerHTML={{ __html: processedHtml }} />
  );

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#1e1e1e] overflow-hidden">
      {/* Find & Replace */}
      {state.showFindReplace && !state.isPreview && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-[#252525] border-b border-gray-200 dark:border-gray-700 flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-1">
            <input type="text" value={state.findQuery} onChange={e => { onSetFindQuery(e.target.value); setFindIndex(0); }}
              placeholder="Find..." className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-[#333] dark:text-white w-36 focus:outline-none focus:border-blue-500" autoFocus />
            <span className="text-[10px] text-gray-400 min-w-[40px]">{findMatches.length > 0 ? `${findIndex + 1}/${findMatches.length}` : '0'}</span>
            <button onClick={() => navigateFind(-1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"><ChevronUp size={14} /></button>
            <button onClick={() => navigateFind(1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"><ChevronDown size={14} /></button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onToggleFindCase} className={`px-1.5 py-0.5 text-[10px] rounded border ${state.findCaseSensitive ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 text-blue-700' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}>Aa</button>
            <button onClick={onToggleFindRegex} className={`px-1.5 py-0.5 text-[10px] rounded border ${state.findRegex ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 text-blue-700' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}>.*</button>
          </div>
          <div className="flex items-center gap-1">
            <input type="text" value={state.replaceQuery} onChange={e => onSetReplaceQuery(e.target.value)}
              placeholder="Replace..." className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-[#333] dark:text-white w-28 focus:outline-none focus:border-blue-500" />
            <button onClick={() => onReplace(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Replace"><Replace size={14} /></button>
            <button onClick={() => onReplace(true)} className="px-1.5 py-0.5 text-[10px] hover:bg-gray-200 dark:hover:bg-gray-600 rounded">All</button>
          </div>
          <button onClick={onCloseFindReplace} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"><X size={14} /></button>
        </div>
      )}

      {/* Title + Tags */}
      <div className="px-6 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <input type="text" value={note.title} onChange={e => onTitleChange(e.target.value)}
          placeholder="Note title..." className="w-full text-xl font-semibold text-gray-800 dark:text-gray-100 placeholder-gray-300 focus:outline-none bg-transparent" readOnly={state.isPreview} />
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {note.tags.map(tag => (
            <span key={tag} className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full">
              {tag}
              {!state.isPreview && <button onClick={() => onTagRemove(tag)} className="hover:text-red-500"><X size={9} /></button>}
            </span>
          ))}
          {!state.isPreview && (
            <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); }}
              placeholder="+ tag" className="w-14 px-1 py-0.5 text-[10px] border border-dashed border-gray-200 rounded focus:outline-none focus:border-blue-500 bg-transparent text-gray-500" />
          )}
          {note.wordGoal > 0 && (
            <span className="ml-auto text-[10px] text-gray-400">
              🎯 {stats.words}/{note.wordGoal} words
            </span>
          )}
        </div>
      </div>

      {/* Editor / Preview / Split */}
      <div className="flex-1 overflow-hidden flex">
        {state.isSplitView ? (
          <>
            <div className="flex-1 flex border-r border-gray-200 dark:border-gray-700">{editorContent}</div>
            {previewContent}
          </>
        ) : state.isPreview ? (
          previewContent
        ) : (
          <div className="flex-1 flex">{editorContent}</div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-1 text-white text-[10px] flex items-center justify-between flex-shrink-0" style={{ background: state.accentColor }}>
        <div className="flex items-center gap-3">
          <span>{stats.words} words</span>
          <span>{stats.chars} chars</span>
          <span>{stats.lines} lines</span>
          <span>{stats.paragraphs} paragraphs</span>
          <span className="hidden sm:inline">~{stats.readTime} min read</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{state.fontFamily} {state.fontSize}px</span>
          <span>{state.wordWrap ? 'Wrap' : 'No Wrap'}</span>
          {state.isSplitView && <span>Split</span>}
          {state.isFocusMode && <span>Focus</span>}
        </div>
      </div>
    </div>
  );
};

export default Editor;
