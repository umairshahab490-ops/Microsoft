import React, { useEffect, useRef, useState } from 'react';
import { Page, Section, Notebook } from '../types';
import { formatDate } from '../utils';

interface RichEditorProps {
  activePage?: Page;
  activeSection?: Section;
  activeNotebook?: Notebook;
  onUpdateContent: (content: string) => void;
  onUpdateTitle: (title: string) => void;
}

export default function RichEditor({
  activePage,
  activeSection,
  activeNotebook,
  onUpdateContent,
  onUpdateTitle,
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Load content into editor
  useEffect(() => {
    if (editorRef.current && activePage) {
      editorRef.current.innerHTML = activePage.content || '<p><br></p>';
    }
  }, [activePage?.id]);

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current && activePage) {
      onUpdateContent(editorRef.current.innerHTML);
    }
  };

  // Handle selection for floating toolbar
  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0 && editorRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 50,
      });
      setShowFloatingToolbar(true);
    } else {
      setShowFloatingToolbar(false);
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Formatting commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  // Font family
  const handleFontFamily = (font: string) => {
    execCommand('fontName', font);
  };

  // Font size
  const handleFontSize = (size: string) => {
    execCommand('fontSize', size);
  };

  // Text color
  const handleTextColor = (color: string) => {
    execCommand('foreColor', color);
  };

  // Highlight color
  const handleHighlightColor = (color: string) => {
    execCommand('hiliteColor', color);
  };

  // Insert table
  const insertTable = () => {
    let table = '<table style="border-collapse: collapse; width: 100%; margin: 1em 0;">';
    for (let i = 0; i < tableRows; i++) {
      table += '<tr>';
      for (let j = 0; j < tableCols; j++) {
        const cellType = i === 0 ? 'th' : 'td';
        const style = 'border: 1px solid #ddd; padding: 8px; text-align: left;';
        const bgStyle = i === 0 ? ' background-color: #f5f5f5; font-weight: bold;' : '';
        table += `<${cellType} style="${style}${bgStyle}">${i === 0 ? `Header ${j + 1}` : 'Cell'}</${cellType}>`;
      }
      table += '</tr>';
    }
    table += '</table><p><br></p>';
    execCommand('insertHTML', table);
    setShowTableDialog(false);
  };

  // Insert image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB to avoid storage issues');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      execCommand('insertHTML', `<img src="${base64}" style="max-width: 100%; height: auto; margin: 1em 0;" />`);
    };
    reader.readAsDataURL(file);
  };

  // Insert link
  const insertLink = () => {
    if (linkUrl) {
      const text = linkText || linkUrl;
      execCommand('insertHTML', `<a href="${linkUrl}" target="_blank" style="color: #7719AA; text-decoration: underline;">${text}</a>`);
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  // Clear formatting
  const clearFormatting = () => {
    execCommand('removeFormat');
  };

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
      <div className="glass-panel px-6 py-2 border-b border-white/20 dark:border-gray-700/50 flex-shrink-0">
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
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="Page title..."
          className="w-full text-2xl font-light text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none bg-transparent"
        />
        <div className="text-xs text-gray-400 mt-1">Edited {formatDate(activePage.updatedAt)}</div>
      </div>

      {/* Rich text toolbar */}
      <div className="glass-panel mx-6 mb-3 rounded-2xl p-3 flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Font family */}
          <select
            onChange={(e) => handleFontFamily(e.target.value)}
            className="tap-target px-3 py-1.5 text-sm bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-white"
            defaultValue=""
          >
            <option value="" disabled>Font</option>
            <option value="Segoe UI">Segoe UI</option>
            <option value="Arial">Arial</option>
            <option value="Calibri">Calibri</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
          </select>

          {/* Font size */}
          <select
            onChange={(e) => handleFontSize(e.target.value)}
            className="tap-target px-3 py-1.5 text-sm bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-white"
            defaultValue=""
          >
            <option value="" disabled>Size</option>
            <option value="1">9px</option>
            <option value="2">10px</option>
            <option value="3">12px</option>
            <option value="4">14px</option>
            <option value="5">18px</option>
            <option value="6">24px</option>
            <option value="7">36px</option>
          </select>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Basic formatting */}
          <button onClick={() => execCommand('bold')} className="tap-target px-3 py-1.5 text-sm font-bold hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Bold">B</button>
          <button onClick={() => execCommand('italic')} className="tap-target px-3 py-1.5 text-sm italic hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Italic">I</button>
          <button onClick={() => execCommand('underline')} className="tap-target px-3 py-1.5 text-sm underline hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Underline">U</button>
          <button onClick={() => execCommand('strikeThrough')} className="tap-target px-3 py-1.5 text-sm line-through hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Strikethrough">S</button>
          <button onClick={() => execCommand('subscript')} className="tap-target px-3 py-1.5 text-xs hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Subscript">X₂</button>
          <button onClick={() => execCommand('superscript')} className="tap-target px-3 py-1.5 text-xs hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Superscript">X²</button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Colors */}
          <input
            type="color"
            onChange={(e) => handleTextColor(e.target.value)}
            className="tap-target w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-600"
            title="Text color"
            defaultValue="#000000"
          />
          <input
            type="color"
            onChange={(e) => handleHighlightColor(e.target.value)}
            className="tap-target w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-600"
            title="Highlight color"
            defaultValue="#FFFF00"
          />
          <button onClick={clearFormatting} className="tap-target px-3 py-1.5 text-xs hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Clear formatting">Clear</button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Headings */}
          <button onClick={() => execCommand('formatBlock', 'h1')} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Heading 1">H1</button>
          <button onClick={() => execCommand('formatBlock', 'h2')} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Heading 2">H2</button>
          <button onClick={() => execCommand('formatBlock', 'h3')} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Heading 3">H3</button>
          <button onClick={() => execCommand('formatBlock', 'p')} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Normal">P</button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Lists */}
          <button onClick={() => execCommand('insertUnorderedList')} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Bullet list">•</button>
          <button onClick={() => execCommand('insertOrderedList')} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Numbered list">1.</button>
          <button onClick={() => execCommand('insertHTML', '<div style="margin: 0.5em 0;"><input type="checkbox" style="margin-right: 0.5em;" /> Task item</div>')} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Task list">☐</button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Alignment */}
          <button onClick={() => execCommand('justifyLeft')} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Align left">⫷</button>
          <button onClick={() => execCommand('justifyCenter')} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Align center">⫿</button>
          <button onClick={() => execCommand('justifyRight')} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Align right">⫸</button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Indent */}
          <button onClick={() => execCommand('indent')} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Indent">→</button>
          <button onClick={() => execCommand('outdent')} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Outdent">←</button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Insert */}
          <button onClick={() => setShowTableDialog(true)} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Insert table">⊞</button>
          <label className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift cursor-pointer" title="Insert image">
            🖼️
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          <button onClick={() => setShowLinkDialog(true)} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Insert link">🔗</button>
          <button onClick={() => execCommand('insertHorizontalRule')} className="tap-target px-3 py-1.5 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg btn-lift" title="Horizontal rule">—</button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="min-h-[400px] text-sm text-gray-800 dark:text-gray-200 leading-relaxed focus:outline-none prose prose-sm dark:prose-invert max-w-none"
          style={{ lineHeight: '1.7' }}
          suppressContentEditableWarning
        />
      </div>

      {/* Floating toolbar for selected text */}
      {showFloatingToolbar && (
        <div
          className="fixed glass-panel rounded-xl px-2 py-1 flex items-center gap-1 z-50 shadow-lg"
          style={{ left: toolbarPosition.x - 80, top: toolbarPosition.y }}
        >
          <button onClick={() => execCommand('bold')} className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded font-bold">B</button>
          <button onClick={() => execCommand('italic')} className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded italic">I</button>
          <button onClick={() => execCommand('underline')} className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded underline">U</button>
          <input
            type="color"
            onChange={(e) => handleTextColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
            defaultValue="#000000"
          />
        </div>
      )}

      {/* Table dialog */}
      {showTableDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowTableDialog(false)}>
          <div className="glass-panel rounded-2xl p-6 max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Insert Table</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Rows</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableRows}
                  onChange={(e) => setTableRows(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-white"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowTableDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={insertTable}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowLinkDialog(false)}>
          <div className="glass-panel rounded-2xl p-6 max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Insert Link</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full mt-1 px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Text (optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
                  className="w-full mt-1 px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-white"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowLinkDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={insertLink}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
