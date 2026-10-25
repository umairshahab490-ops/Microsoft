import React, { useRef, useCallback, useEffect } from 'react';
import { marked } from 'marked';
import { FileText } from 'lucide-react';

// Configure marked for performance
marked.setOptions({
  breaks: true,
  gfm: true,
});

interface EditorProps {
  content: string;
  title: string;
  isPreview: boolean;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  editorRef: React.RefObject<HTMLTextAreaElement>;
}

const Editor: React.FC<EditorProps> = ({
  content,
  title,
  isPreview,
  onContentChange,
  onTitleChange,
  editorRef,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onContentChange(e.target.value);
    },
    [onContentChange]
  );

  // Auto-resize textarea (lightweight approach)
  useEffect(() => {
    const textarea = editorRef.current;
    if (textarea && !isPreview) {
      textarea.focus();
    }
  }, [isPreview, editorRef]);

  const renderedMarkdown = isPreview ? marked.parse(content || '*No content*') as string : '';

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Title Bar */}
      <div className="px-6 pt-4 pb-2 border-b border-gray-100">
        <input
          type="text"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Note title..."
          className="w-full text-xl font-semibold text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
          readOnly={isPreview}
        />
      </div>

      {/* Editor / Preview Area */}
      <div className="flex-1 overflow-y-auto">
        {isPreview ? (
          <div
            ref={previewRef}
            className="prose prose-sm max-w-none p-6 md:p-10 markdown-preview"
            dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
          />
        ) : (
          <textarea
            ref={editorRef}
            value={content}
            onChange={handleChange}
            placeholder="Start writing... (Markdown supported)"
            className="w-full h-full p-6 md:p-10 text-sm text-gray-800 leading-relaxed resize-none focus:outline-none font-mono bg-transparent placeholder-gray-300"
            spellCheck={false}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-1 bg-[#2b579a] text-white text-[10px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>{content.length} characters</span>
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
          <span>{content.split('\n').length} lines</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText size={10} />
          <span>{isPreview ? 'Preview' : 'Edit'}</span>
        </div>
      </div>
    </div>
  );
};

export default Editor;
