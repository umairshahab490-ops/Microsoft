import React, { useState } from 'react';
import {
  FilePlus, Trash2, Eye, Edit3, Bold, Italic, List, ListOrdered,
  Heading1, Heading2, Heading3, Code, Link, Minus, Quote, CheckSquare,
  Strikethrough, Image, Table, Undo2, Redo2, Search, Download, Upload,
  Settings, Keyboard, Maximize2, Minimize2, Menu, Type, Palette,
} from 'lucide-react';

interface ToolbarProps {
  isPreview: boolean;
  isFullscreen: boolean;
  sidebarOpen: boolean;
  hasActiveNote: boolean;
  fontSize: number;
  fontFamily: string;
  onTogglePreview: () => void;
  onToggleFullscreen: () => void;
  onToggleSidebar: () => void;
  onNewNote: () => void;
  onDeleteNote: () => void;
  onInsertMarkdown: (syntax: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onToggleFindReplace: () => void;
  onToggleExport: () => void;
  onToggleSettings: () => void;
  onToggleShortcuts: () => void;
  onToggleTemplates: () => void;
  onImport: () => void;
}

const Tb: React.FC<{
  icon: React.ReactNode; label: string; onClick: () => void;
  active?: boolean; disabled?: boolean;
}> = React.memo(({ icon, label, onClick, active, disabled }) => (
  <button
    onClick={onClick} disabled={disabled} title={label}
    className={`p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-75 ${
      active ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'
    } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
  >{icon}</button>
));

const Div = () => <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-0.5 flex-shrink-0" />;

const FONT_FAMILIES = [
  'Segoe UI', 'Arial', 'Times New Roman', 'Courier New', 'Georgia',
  'Verdana', 'Consolas', 'Monaco', 'Trebuchet MS',
];

const Toolbar: React.FC<ToolbarProps> = ({
  isPreview, isFullscreen, sidebarOpen, hasActiveNote, fontSize, fontFamily,
  onTogglePreview, onToggleFullscreen, onToggleSidebar, onNewNote, onDeleteNote,
  onInsertMarkdown, onUndo, onRedo, onFontSizeChange, onFontFamilyChange,
  onToggleFindReplace, onToggleExport, onToggleSettings, onToggleShortcuts,
  onToggleTemplates, onImport,
}) => {
  const [showFontMenu, setShowFontMenu] = useState(false);

  return (
    <div className="bg-[#f3f3f3] dark:bg-[#2d2d2d] border-b border-gray-300 dark:border-gray-600 select-none flex-shrink-0">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#2b579a]">
        <div className="flex items-center gap-2">
          <button onClick={onToggleSidebar} className="text-white/80 hover:text-white p-0.5">
            <Menu size={16} />
          </button>
          <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">W</span>
          </div>
          <span className="text-white text-sm font-medium hidden sm:inline">Word Notes Pro</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={onToggleTemplates} className="flex items-center gap-1 px-2 py-0.5 text-xs text-white/90 hover:bg-white/10 rounded" title="Templates">
            <Type size={13} /><span className="hidden sm:inline">Templates</span>
          </button>
          <button onClick={onImport} className="flex items-center gap-1 px-2 py-0.5 text-xs text-white/90 hover:bg-white/10 rounded" title="Import">
            <Upload size={13} /><span className="hidden sm:inline">Import</span>
          </button>
          <button onClick={onToggleExport} className="flex items-center gap-1 px-2 py-0.5 text-xs text-white/90 hover:bg-white/10 rounded" title="Export (Ctrl+E)">
            <Download size={13} /><span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={onToggleFullscreen} className="flex items-center gap-1 px-2 py-0.5 text-xs text-white/90 hover:bg-white/10 rounded" title="Fullscreen (Ctrl+Shift+F)">
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Ribbon */}
      <div className="flex items-center px-1.5 py-1 gap-0.5 overflow-x-auto scrollbar-thin">
        {/* Clipboard group */}
        <div className="flex items-center gap-0.5">
          <Tb icon={<Undo2 size={15} />} label="Undo (Ctrl+Z)" onClick={onUndo} disabled={!hasActiveNote} />
          <Tb icon={<Redo2 size={15} />} label="Redo (Ctrl+Y)" onClick={onRedo} disabled={!hasActiveNote} />
        </div>
        <Div />

        {/* View */}
        <div className="flex items-center gap-0.5">
          <Tb icon={<FilePlus size={15} />} label="New Note (Ctrl+N)" onClick={onNewNote} />
          <Tb icon={<Trash2 size={15} />} label="Delete (Ctrl+D)" onClick={onDeleteNote} disabled={!hasActiveNote} />
          <Tb icon={isPreview ? <Edit3 size={15} /> : <Eye size={15} />} label={isPreview ? 'Edit (Ctrl+P)' : 'Preview (Ctrl+P)'} onClick={onTogglePreview} active={isPreview} disabled={!hasActiveNote} />
        </div>
        <Div />

        {/* Font */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowFontMenu(!showFontMenu)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded min-w-[100px] justify-between"
            >
              <span className="truncate">{fontFamily}</span>
              <span className="text-gray-400">▾</span>
            </button>
            {showFontMenu && (
              <div className="absolute top-full left-0 mt-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded shadow-lg z-50 max-h-[200px] overflow-y-auto min-w-[140px]">
                {FONT_FAMILIES.map(f => (
                  <button key={f} onClick={() => { onFontFamilyChange(f); setShowFontMenu(false); }}
                    className={`w-full px-3 py-1 text-left text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 ${fontFamily === f ? 'bg-blue-50 dark:bg-blue-900/30 text-[#2b579a]' : ''}`}
                    style={{ fontFamily: f }}
                  >{f}</button>
                ))}
              </div>
            )}
          </div>
          <select
            value={fontSize}
            onChange={e => onFontSizeChange(Number(e.target.value))}
            className="px-1.5 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded w-14"
            title="Font size"
          >
            {[10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 28, 32, 36].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <Div />

        {/* Formatting */}
        <div className="flex items-center gap-0.5">
          <Tb icon={<Bold size={15} />} label="Bold (Ctrl+B)" onClick={() => onInsertMarkdown('bold')} disabled={!hasActiveNote || isPreview} />
          <Tb icon={<Italic size={15} />} label="Italic (Ctrl+I)" onClick={() => onInsertMarkdown('italic')} disabled={!hasActiveNote || isPreview} />
          <Tb icon={<Strikethrough size={15} />} label="Strikethrough" onClick={() => onInsertMarkdown('strikethrough')} disabled={!hasActiveNote || isPreview} />
        </div>
        <Div />

        {/* Headings */}
        <div className="flex items-center gap-0.5">
          <Tb icon={<Heading1 size={15} />} label="Heading 1" onClick={() => onInsertMarkdown('h1')} disabled={!hasActiveNote || isPreview} />
          <Tb icon={<Heading2 size={15} />} label="Heading 2" onClick={() => onInsertMarkdown('h2')} disabled={!hasActiveNote || isPreview} />
          <Tb icon={<Heading3 size={15} />} label="Heading 3" onClick={() => onInsertMarkdown('h3')} disabled={!hasActiveNote || isPreview} />
        </div>
        <Div />

        {/* Lists */}
        <div className="flex items-center gap-0.5">
          <Tb icon={<List size={15} />} label="Bullet List" onClick={() => onInsertMarkdown('ul')} disabled={!hasActiveNote || isPreview} />
          <Tb icon={<ListOrdered size={15} />} label="Numbered List" onClick={() => onInsertMarkdown('ol')} disabled={!hasActiveNote || isPreview} />
          <Tb icon={<CheckSquare size={15} />} label="Task List" onClick={() => onInsertMarkdown('task')} disabled={!hasActiveNote || isPreview} />
        </div>
        <Div />

        {/* Insert */}
        <div className="flex items-center gap-0.5">
          <Tb icon={<Code size={15} />} label="Code Block" onClick={() => onInsertMarkdown('code')} disabled={!hasActiveNote || isPreview} />
          <Tb icon={<Palette size={15} />} label="Inline Code" onClick={() => onInsertMarkdown('inlinecode')} disabled={!hasActiveNote || isPreview} />
          <Tb icon={<Link size={15} />} label="Link" onClick={() => onInsertMarkdown('link')} disabled={!hasActiveNote || isPreview} />
          <Tb icon={<Image size={15} />} label="Image" onClick={() => onInsertMarkdown('image')} disabled={!hasActiveNote || isPreview} />
          <Tb icon={<Quote size={15} />} label="Blockquote" onClick={() => onInsertMarkdown('quote')} disabled={!hasActiveNote || isPreview} />
          <Tb icon={<Table size={15} />} label="Table" onClick={() => onInsertMarkdown('table')} disabled={!hasActiveNote || isPreview} />
          <Tb icon={<Minus size={15} />} label="Horizontal Rule" onClick={() => onInsertMarkdown('hr')} disabled={!hasActiveNote || isPreview} />
        </div>
        <Div />

        {/* Tools */}
        <div className="flex items-center gap-0.5">
          <Tb icon={<Search size={15} />} label="Find & Replace (Ctrl+H)" onClick={onToggleFindReplace} disabled={!hasActiveNote} />
          <Tb icon={<Settings size={15} />} label="Settings" onClick={onToggleSettings} />
          <Tb icon={<Keyboard size={15} />} label="Keyboard Shortcuts" onClick={onToggleShortcuts} />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
