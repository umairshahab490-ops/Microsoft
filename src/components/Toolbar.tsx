import React, { useState } from 'react';
import {
  FilePlus, Trash2, Eye, Edit3, Bold, Italic, List, ListOrdered,
  Heading1, Heading2, Heading3, Code, Link, Minus, Quote, CheckSquare,
  Strikethrough, Image, Table, Undo2, Redo2, Search, Download, Upload,
  Settings, Keyboard, Maximize2, Minimize2, Menu, Type, Palette,
  Columns, Focus, Timer, BarChart3, BookOpen, Smile, Command, ListTree,
  Archive, History, StickyNote,
} from 'lucide-react';
import { AppState } from '../types';

interface ToolbarProps {
  state: AppState;
  hasActiveNote: boolean;
  onTogglePreview: () => void;
  onToggleFullscreen: () => void;
  onToggleSidebar: () => void;
  onToggleSplitView: () => void;
  onToggleFocusMode: () => void;
  onNewNote: () => void;
  onDeleteNote: () => void;
  onInsertMarkdown: (syntax: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onToggle: (modal: string) => void;
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

const FONT_FAMILIES = ['Segoe UI', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Consolas', 'Monaco', 'Trebuchet MS'];

const Toolbar: React.FC<ToolbarProps> = ({
  state, hasActiveNote, onTogglePreview, onToggleFullscreen, onToggleSidebar,
  onToggleSplitView, onToggleFocusMode,
  onNewNote, onDeleteNote, onInsertMarkdown, onUndo, onRedo, onFontSizeChange,
  onFontFamilyChange, onToggle, onImport,
}) => {
  const [showFontMenu, setShowFontMenu] = useState(false);

  return (
    <div className="bg-[#f3f3f3] dark:bg-[#2d2d2d] border-b border-gray-300 dark:border-gray-600 select-none flex-shrink-0">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-3 py-1" style={{ background: state.accentColor }}>
        <div className="flex items-center gap-2">
          <button onClick={onToggleSidebar} className="text-white/80 hover:text-white p-0.5"><Menu size={16} /></button>
          <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">W</span>
          </div>
          <span className="text-white text-sm font-medium hidden sm:inline">Word Notes Pro</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => onToggle('QuickNote')} className="flex items-center gap-1 px-2 py-0.5 text-xs text-white/90 hover:bg-white/10 rounded" title="Quick Note">
            <StickyNote size={13} /><span className="hidden lg:inline">Quick</span>
          </button>
          <button onClick={() => onToggle('Templates')} className="flex items-center gap-1 px-2 py-0.5 text-xs text-white/90 hover:bg-white/10 rounded" title="Templates">
            <Type size={13} /><span className="hidden lg:inline">Templates</span>
          </button>
          <button onClick={onImport} className="flex items-center gap-1 px-2 py-0.5 text-xs text-white/90 hover:bg-white/10 rounded" title="Import">
            <Upload size={13} /><span className="hidden lg:inline">Import</span>
          </button>
          <button onClick={() => onToggle('Export')} className="flex items-center gap-1 px-2 py-0.5 text-xs text-white/90 hover:bg-white/10 rounded" title="Export (Ctrl+E)">
            <Download size={13} /><span className="hidden lg:inline">Export</span>
          </button>
          <button onClick={() => onToggle('Pomodoro')} className="flex items-center gap-1 px-2 py-0.5 text-xs text-white/90 hover:bg-white/10 rounded" title="Pomodoro Timer">
            <Timer size={13} />
          </button>
          <button onClick={onToggleFullscreen} className="flex items-center gap-1 px-2 py-0.5 text-xs text-white/90 hover:bg-white/10 rounded" title="Fullscreen">
            {state.isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Ribbon */}
      <div className="flex items-center px-1.5 py-1 gap-0.5 overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-0.5">
          <Tb icon={<Undo2 size={15} />} label="Undo (Ctrl+Z)" onClick={onUndo} disabled={!hasActiveNote} />
          <Tb icon={<Redo2 size={15} />} label="Redo (Ctrl+Y)" onClick={onRedo} disabled={!hasActiveNote} />
        </div>
        <Div />
        <div className="flex items-center gap-0.5">
          <Tb icon={<FilePlus size={15} />} label="New Note (Ctrl+N)" onClick={onNewNote} />
          <Tb icon={<Trash2 size={15} />} label="Delete (Ctrl+D)" onClick={onDeleteNote} disabled={!hasActiveNote} />
          <Tb icon={state.isPreview ? <Edit3 size={15} /> : <Eye size={15} />} label={state.isPreview ? 'Edit (Ctrl+P)' : 'Preview (Ctrl+P)'} onClick={onTogglePreview} active={state.isPreview} disabled={!hasActiveNote} />
          <Tb icon={<Columns size={15} />} label="Split View (Ctrl+Shift+S)" onClick={onToggleSplitView} active={state.isSplitView} disabled={!hasActiveNote} />
          <Tb icon={<Focus size={15} />} label="Focus Mode (Ctrl+Shift+T)" onClick={onToggleFocusMode} active={state.isFocusMode} />
        </div>
        <Div />
        <div className="flex items-center gap-1">
          <div className="relative">
            <button onClick={() => setShowFontMenu(!showFontMenu)} className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded min-w-[100px] justify-between">
              <span className="truncate">{state.fontFamily}</span>
              <span className="text-gray-400">▾</span>
            </button>
            {showFontMenu && (
              <div className="absolute top-full left-0 mt-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded shadow-lg z-50 max-h-[200px] overflow-y-auto min-w-[140px]">
                {FONT_FAMILIES.map(f => (
                  <button key={f} onClick={() => { onFontFamilyChange(f); setShowFontMenu(false); }}
                    className={`w-full px-3 py-1 text-left text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 ${state.fontFamily === f ? 'bg-blue-50 text-blue-700' : ''}`}
                    style={{ fontFamily: f }}
                  >{f}</button>
                ))}
              </div>
            )}
          </div>
          <select value={state.fontSize} onChange={e => onFontSizeChange(Number(e.target.value))}
            className="px-1.5 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded w-14" title="Font size">
            {[10,11,12,13,14,16,18,20,22,24,28,32,36].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Div />
        <div className="flex items-center gap-0.5">
          <Tb icon={<Bold size={15} />} label="Bold (Ctrl+B)" onClick={() => onInsertMarkdown('bold')} disabled={!hasActiveNote || state.isPreview} />
          <Tb icon={<Italic size={15} />} label="Italic (Ctrl+I)" onClick={() => onInsertMarkdown('italic')} disabled={!hasActiveNote || state.isPreview} />
          <Tb icon={<Strikethrough size={15} />} label="Strikethrough" onClick={() => onInsertMarkdown('strikethrough')} disabled={!hasActiveNote || state.isPreview} />
        </div>
        <Div />
        <div className="flex items-center gap-0.5">
          <Tb icon={<Heading1 size={15} />} label="Heading 1" onClick={() => onInsertMarkdown('h1')} disabled={!hasActiveNote || state.isPreview} />
          <Tb icon={<Heading2 size={15} />} label="Heading 2" onClick={() => onInsertMarkdown('h2')} disabled={!hasActiveNote || state.isPreview} />
          <Tb icon={<Heading3 size={15} />} label="Heading 3" onClick={() => onInsertMarkdown('h3')} disabled={!hasActiveNote || state.isPreview} />
        </div>
        <Div />
        <div className="flex items-center gap-0.5">
          <Tb icon={<List size={15} />} label="Bullet List" onClick={() => onInsertMarkdown('ul')} disabled={!hasActiveNote || state.isPreview} />
          <Tb icon={<ListOrdered size={15} />} label="Numbered List" onClick={() => onInsertMarkdown('ol')} disabled={!hasActiveNote || state.isPreview} />
          <Tb icon={<CheckSquare size={15} />} label="Task List" onClick={() => onInsertMarkdown('task')} disabled={!hasActiveNote || state.isPreview} />
        </div>
        <Div />
        <div className="flex items-center gap-0.5">
          <Tb icon={<Code size={15} />} label="Code Block" onClick={() => onInsertMarkdown('code')} disabled={!hasActiveNote || state.isPreview} />
          <Tb icon={<Palette size={15} />} label="Inline Code" onClick={() => onInsertMarkdown('inlinecode')} disabled={!hasActiveNote || state.isPreview} />
          <Tb icon={<Link size={15} />} label="Link" onClick={() => onInsertMarkdown('link')} disabled={!hasActiveNote || state.isPreview} />
          <Tb icon={<Image size={15} />} label="Image" onClick={() => onInsertMarkdown('image')} disabled={!hasActiveNote || state.isPreview} />
          <Tb icon={<Quote size={15} />} label="Blockquote" onClick={() => onInsertMarkdown('quote')} disabled={!hasActiveNote || state.isPreview} />
          <Tb icon={<Table size={15} />} label="Table" onClick={() => onInsertMarkdown('table')} disabled={!hasActiveNote || state.isPreview} />
          <Tb icon={<Minus size={15} />} label="Horizontal Rule" onClick={() => onInsertMarkdown('hr')} disabled={!hasActiveNote || state.isPreview} />
          <Tb icon={<Smile size={15} />} label="Emoji" onClick={() => onToggle('EmojiPicker')} disabled={!hasActiveNote || state.isPreview} />
        </div>
        <Div />
        <div className="flex items-center gap-0.5">
          <Tb icon={<Search size={15} />} label="Find & Replace (Ctrl+H)" onClick={() => onToggle('FindReplace')} disabled={!hasActiveNote} />
          <Tb icon={<Command size={15} />} label="Command Palette (Ctrl+K)" onClick={() => onToggle('CommandPalette')} />
          <Tb icon={<ListTree size={15} />} label="Table of Contents" onClick={() => onToggle('TOC')} disabled={!hasActiveNote} />
          <Tb icon={<History size={15} />} label="Version History" onClick={() => onToggle('Versions')} disabled={!hasActiveNote} />
          <Tb icon={<BarChart3 size={15} />} label="Statistics" onClick={() => onToggle('Stats')} />
          <Tb icon={<BookOpen size={15} />} label="Markdown Cheatsheet" onClick={() => onToggle('Cheatsheet')} />
          <Tb icon={<Settings size={15} />} label="Settings" onClick={() => onToggle('Settings')} />
          <Tb icon={<Keyboard size={15} />} label="Keyboard Shortcuts" onClick={() => onToggle('Shortcuts')} />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
