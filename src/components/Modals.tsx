import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Download, FileText, Code, File, Moon, Sun, Hash, WrapText, Palette, Search, Timer, BarChart3, History, Smile, StickyNote, ListTree, BookOpen, Command, Save, Upload } from 'lucide-react';
import { Note, AppState } from '../types';
import { exportNote, exportAllNotes, TEMPLATES, getStats } from '../utils';

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }> = ({ isOpen, onClose, title, children, wide }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className={`relative bg-white dark:bg-[#2d2d2d] rounded-lg shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-md'} w-full max-h-[80vh] overflow-hidden`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"><X size={16} className="text-gray-500" /></button>
        </div>
        <div className="overflow-y-auto max-h-[calc(80vh-60px)] p-4">{children}</div>
      </div>
    </div>
  );
};

// ── Export Modal ────────────────────────────────────────────
export const ExportModal: React.FC<{ isOpen: boolean; onClose: () => void; note: Note | null; allNotes: Note[] }> = ({ isOpen, onClose, note, allNotes }) => {
  if (!note) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Notes">
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Current: {note.title}</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['md', 'html', 'txt'] as const).map(fmt => (
              <button key={fmt} onClick={() => { exportNote(note, fmt); onClose(); }} className="flex flex-col items-center gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                {fmt === 'md' ? <FileText size={24} className="text-blue-600" /> : fmt === 'html' ? <Code size={24} className="text-green-600" /> : <File size={24} className="text-orange-600" />}
                <span className="text-xs text-gray-600 dark:text-gray-300">{fmt.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
        <hr className="dark:border-gray-600" />
        <button onClick={() => { exportAllNotes(allNotes); onClose(); }} className="flex items-center gap-2 w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
          <Download size={20} className="text-blue-600" />
          <div className="text-left"><span className="text-xs font-medium">Export All ({allNotes.length} notes)</span></div>
        </button>
      </div>
    </Modal>
  );
};

// ── Templates Modal ─────────────────────────────────────────
export const TemplatesModal: React.FC<{ isOpen: boolean; onClose: () => void; onApply: (t: Partial<Note>) => void }> = ({ isOpen, onClose, onApply }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Note Templates" wide>
    <div className="grid grid-cols-3 gap-3">
      {TEMPLATES.map(t => (
        <button key={t.name} onClick={() => { onApply({ title: t.name, content: t.content }); onClose(); }}
          className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 transition-colors text-center">
          <span className="text-2xl">{t.icon}</span>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{t.name}</span>
        </button>
      ))}
    </div>
  </Modal>
);

// ── Settings Modal ──────────────────────────────────────────
export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; state: AppState; dispatch: React.Dispatch<any> }> = ({ isOpen, onClose, state, dispatch }) => {
  const accentColors = ['#2b579a', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">{state.isDark ? <Moon size={16} className="text-blue-400" /> : <Sun size={16} className="text-yellow-500" />}
            <span className="text-sm">Dark Mode</span></div>
          <button onClick={() => dispatch({ type: 'TOGGLE_DARK' })} className={`w-10 h-5 rounded-full transition-colors ${state.isDark ? 'bg-blue-600' : 'bg-gray-300'} relative`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${state.isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider">Accent Color</label>
          <div className="flex gap-2 mt-2">
            {accentColors.map(c => (
              <button key={c} onClick={() => dispatch({ type: 'SET_ACCENT_COLOR', color: c })}
                className={`w-7 h-7 rounded-full border-2 transition-all ${state.accentColor === c ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider">Font Family</label>
          <select value={state.fontFamily} onChange={e => dispatch({ type: 'SET_FONT_FAMILY', family: e.target.value })}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-[#333] dark:text-white">
            {['Segoe UI', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Consolas', 'Monaco'].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider">Font Size: {state.fontSize}px</label>
          <input type="range" min={10} max={32} value={state.fontSize} onChange={e => dispatch({ type: 'SET_FONT_SIZE', size: Number(e.target.value) })} className="mt-1 w-full accent-blue-600" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Hash size={16} className="text-gray-500" /><span className="text-sm">Line Numbers</span></div>
          <button onClick={() => dispatch({ type: 'TOGGLE_LINE_NUMBERS' })} className={`w-10 h-5 rounded-full transition-colors ${state.showLineNumbers ? 'bg-blue-600' : 'bg-gray-300'} relative`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${state.showLineNumbers ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><WrapText size={16} className="text-gray-500" /><span className="text-sm">Word Wrap</span></div>
          <button onClick={() => dispatch({ type: 'TOGGLE_WORD_WRAP' })} className={`w-10 h-5 rounded-full transition-colors ${state.wordWrap ? 'bg-blue-600' : 'bg-gray-300'} relative`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${state.wordWrap ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Spell Check</span>
          <button onClick={() => dispatch({ type: 'TOGGLE_SPELL_CHECK' })} className={`w-10 h-5 rounded-full transition-colors ${state.spellCheck ? 'bg-blue-600' : 'bg-gray-300'} relative`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${state.spellCheck ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <hr className="dark:border-gray-600" />
        <div className="flex gap-2">
          <button onClick={() => dispatch({ type: 'BACKUP_DATA' })} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100">
            <Download size={14} /> Backup
          </button>
          <button onClick={() => {
            const input = document.createElement('input');
            input.type = 'file'; input.accept = '.json';
            input.onchange = () => {
              const file = input.files?.[0]; if (!file) return;
              const reader = new FileReader();
              reader.onload = () => { try { dispatch({ type: 'RESTORE_DATA', data: JSON.parse(reader.result as string) }); } catch { alert('Invalid file'); } };
              reader.readAsText(file);
            };
            input.click();
          }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-100">
            <Upload size={14} /> Restore
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Shortcuts Modal ─────────────────────────────────────────
export const ShortcutsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const shortcuts = [
    ['Ctrl+N', 'New note'], ['Ctrl+P', 'Toggle preview'], ['Ctrl+F', 'Search'], ['Ctrl+H', 'Find & Replace'],
    ['Ctrl+K', 'Command Palette'], ['Ctrl+D', 'Delete note'], ['Ctrl+E', 'Export'], ['Ctrl+\\', 'Toggle sidebar'],
    ['Ctrl+Shift+F', 'Fullscreen'], ['Ctrl+Shift+S', 'Split View'], ['Ctrl+Shift+T', 'Focus Mode'],
    ['Ctrl+↑/↓', 'Navigate notes'], ['Ctrl+Shift+D', 'Duplicate'], ['Ctrl+Z/Y', 'Undo/Redo'],
    ['Ctrl+B/I', 'Bold/Italic'], ['Tab/Shift+Tab', 'Indent/Outdent'], ['Escape', 'Close/Exit'],
  ];
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" wide>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {shortcuts.map(([key, desc]) => (
          <div key={key} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700">
            <span className="text-xs text-gray-600 dark:text-gray-300">{desc}</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-600 dark:text-gray-300 font-mono">{key}</kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
};

// ── Command Palette ─────────────────────────────────────────
export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void; query: string; onQueryChange: (q: string) => void; onExecute: (cmd: string) => void }> = ({ isOpen, onClose, query, onQueryChange, onExecute }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const commands = [
    { id: 'new', label: 'New Note', icon: '📝', keys: 'Ctrl+N' },
    { id: 'preview', label: 'Toggle Preview', icon: '👁️', keys: 'Ctrl+P' },
    { id: 'split', label: 'Toggle Split View', icon: '📐', keys: 'Ctrl+Shift+S' },
    { id: 'focus', label: 'Toggle Focus Mode', icon: '🎯', keys: 'Ctrl+Shift+T' },
    { id: 'fullscreen', label: 'Toggle Fullscreen', icon: '🖥️', keys: 'Ctrl+Shift+F' },
    { id: 'dark', label: 'Toggle Dark Mode', icon: '🌙' },
    { id: 'export', label: 'Export Note', icon: '📤', keys: 'Ctrl+E' },
    { id: 'templates', label: 'Open Templates', icon: '📋' },
    { id: 'settings', label: 'Open Settings', icon: '⚙️' },
    { id: 'shortcuts', label: 'Show Shortcuts', icon: '⌨️' },
    { id: 'cheatsheet', label: 'Markdown Cheatsheet', icon: '📖' },
    { id: 'stats', label: 'Writing Statistics', icon: '📊' },
    { id: 'versions', label: 'Version History', icon: '📜' },
    { id: 'pomodoro', label: 'Pomodoro Timer', icon: '⏱️' },
    { id: 'toc', label: 'Table of Contents', icon: '📑' },
    { id: 'backup', label: 'Backup Data', icon: '💾' },
    { id: 'restore', label: 'Restore Data', icon: '📥' },
    { id: 'sidebar', label: 'Toggle Sidebar', icon: '📂', keys: 'Ctrl+\\' },
    { id: 'find', label: 'Find & Replace', icon: '🔍', keys: 'Ctrl+H' },
  ];
  const filtered = query ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase())) : commands;

  useEffect(() => { if (isOpen) { inputRef.current?.focus(); onQueryChange(''); } }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white dark:bg-[#2d2d2d] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <Command size={16} className="text-gray-400" />
          <input ref={inputRef} type="text" value={query} onChange={e => onQueryChange(e.target.value)}
            placeholder="Type a command..." className="flex-1 text-sm bg-transparent focus:outline-none dark:text-white"
            onKeyDown={e => { if (e.key === 'Enter' && filtered[0]) onExecute(filtered[0].id); if (e.key === 'Escape') onClose(); }} />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filtered.map(cmd => (
            <button key={cmd.id} onClick={() => onExecute(cmd.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <span className="text-lg">{cmd.icon}</span>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">{cmd.label}</span>
              {cmd.keys && <kbd className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-500 font-mono">{cmd.keys}</kbd>}
            </button>
          ))}
          {filtered.length === 0 && <div className="p-4 text-center text-gray-400 text-sm">No commands found</div>}
        </div>
      </div>
    </div>
  );
};

// ── Cheatsheet Modal ────────────────────────────────────────
export const CheatsheetModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Markdown Cheatsheet" wide>
    <div className="grid grid-cols-2 gap-4 text-xs">
      {[
        ['# Heading 1', 'h1'], ['## Heading 2', 'h2'], ['**bold**', 'bold'], ['*italic*', 'italic'],
        ['~~strikethrough~~', 'strike'], ['`inline code`', 'code'], ['```code block```', 'codeblock'],
        ['> blockquote', 'quote'], ['- list item', 'ul'], ['1. numbered', 'ol'], ['[link](url)', 'link'],
        ['![alt](url)', 'image'], ['---', 'hr'], ['| table |', 'table'], ['- [ ] task', 'task'],
        ['[[wiki link]]', 'wiki'],
      ].map(([syntax, name]) => (
        <div key={name} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <code className="text-blue-600 dark:text-blue-400 font-mono text-[11px] flex-1">{syntax}</code>
        </div>
      ))}
    </div>
  </Modal>
);

// ── Stats Modal ─────────────────────────────────────────────
export const StatsModal: React.FC<{ isOpen: boolean; onClose: () => void; notes: Note[] }> = ({ isOpen, onClose, notes }) => {
  const activeNotes = notes.filter(n => !n.archived);
  const totalWords = activeNotes.reduce((sum, n) => sum + getStats(n.content).words, 0);
  const totalChars = activeNotes.reduce((sum, n) => sum + n.content.length, 0);
  const totalLines = activeNotes.reduce((sum, n) => sum + n.content.split('\n').length, 0);
  const avgWords = activeNotes.length > 0 ? Math.round(totalWords / activeNotes.length) : 0;
  const longest = activeNotes.reduce((max, n) => n.content.length > max.content.length ? n : max, activeNotes[0]);
  const today = new Date().toDateString();
  const todayNotes = activeNotes.filter(n => new Date(n.updatedAt).toDateString() === today).length;
  const thisWeek = activeNotes.filter(n => Date.now() - n.updatedAt < 7 * 86400000).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Writing Statistics">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Notes', value: activeNotes.length, icon: '📝' },
          { label: 'Total Words', value: totalWords.toLocaleString(), icon: '📖' },
          { label: 'Total Characters', value: totalChars.toLocaleString(), icon: '🔤' },
          { label: 'Total Lines', value: totalLines.toLocaleString(), icon: '📏' },
          { label: 'Avg Words/Note', value: avgWords, icon: '📊' },
          { label: 'Today', value: todayNotes, icon: '📅' },
          { label: 'This Week', value: thisWeek, icon: '📆' },
          { label: 'Favorites', value: activeNotes.filter(n => n.favorite).length, icon: '⭐' },
        ].map(s => (
          <div key={s.label} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-lg">{s.icon}</div>
            <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{s.value}</div>
            <div className="text-[10px] text-gray-500 uppercase">{s.label}</div>
          </div>
        ))}
      </div>
      {longest && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-[10px] text-blue-600 uppercase">Longest Note</div>
          <div className="text-sm font-medium truncate">{longest.title}</div>
          <div className="text-xs text-gray-500">{getStats(longest.content).words} words</div>
        </div>
      )}
    </Modal>
  );
};

// ── Versions Modal ──────────────────────────────────────────
export const VersionsModal: React.FC<{ isOpen: boolean; onClose: () => void; note: Note | null; onSave: (label: string) => void; onRestore: (vid: string) => void }> = ({ isOpen, onClose, note, onSave, onRestore }) => {
  const [label, setLabel] = useState('');
  if (!note) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Version History">
      <div className="mb-4 flex gap-2">
        <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="Version label..."
          className="flex-1 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-[#333] dark:text-white focus:outline-none focus:border-blue-500" />
        <button onClick={() => { onSave(label || `v${note.versions.length + 1}`); setLabel(''); }}
          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
          <Save size={12} /> Save
        </button>
      </div>
      <div className="space-y-2">
        {note.versions.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">No versions saved yet</p>
        ) : note.versions.map(v => (
          <div key={v.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <div>
              <div className="text-xs font-medium">{v.label}</div>
              <div className="text-[10px] text-gray-400">{new Date(v.timestamp).toLocaleString()}</div>
            </div>
            <button onClick={() => { onRestore(v.id); onClose(); }} className="px-2 py-1 text-[10px] text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">Restore</button>
          </div>
        ))}
      </div>
    </Modal>
  );
};

// ── Emoji Picker ────────────────────────────────────────────
export const EmojiPickerModal: React.FC<{ isOpen: boolean; onClose: () => void; onSelect: (emoji: string) => void }> = ({ isOpen, onClose, onSelect }) => {
  const emojis = ['😀','😂','🥰','😎','🤔','😢','😡','🥳','🤯','😴','🙌','👍','👎','❤️','💔','🔥','⭐','💡','🎉','🎯','✅','❌','⚡','🌈','🌟','💪','🙏','👀','📝','📚','💻','🎨','🎵','🏆','💰','🔑','🚀','💎','🌍','☕','🍕','🎂','🌺','🐱','🐶','🦄','👻','🎃','🎄','🎁'];
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Emoji Picker">
      <div className="grid grid-cols-10 gap-1">
        {emojis.map(e => (
          <button key={e} onClick={() => onSelect(e)} className="p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">{e}</button>
        ))}
      </div>
    </Modal>
  );
};

// ── Quick Note ──────────────────────────────────────────────
export const QuickNoteModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (title: string, content: string) => void }> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Note">
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title..."
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-[#333] dark:text-white mb-2 focus:outline-none focus:border-blue-500" autoFocus />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Quick thoughts..."
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-[#333] dark:text-white h-32 resize-none focus:outline-none focus:border-blue-500" />
      <button onClick={() => { if (title || content) { onSave(title || 'Quick Note', content); setTitle(''); setContent(''); onClose(); } }}
        className="mt-3 w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save Note</button>
    </Modal>
  );
};

// ── Pomodoro Timer ──────────────────────────────────────────
export const PomodoroModal: React.FC<{ isOpen: boolean; onClose: () => void; state: AppState; dispatch: React.Dispatch<any> }> = ({ isOpen, onClose, state, dispatch }) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.pomodoroRunning && state.pomodoroTime > 0) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'SET_POMODORO_TIME', time: state.pomodoroTime - 1 });
      }, 1000);
    } else if (state.pomodoroTime === 0) {
      dispatch({ type: 'TOGGLE_POMODORO' });
      if (state.pomodoroType === 'work') {
        dispatch({ type: 'SET_POMODORO_TYPE', pomodoroType: 'break' });
      } else {
        dispatch({ type: 'SET_POMODORO_TYPE', pomodoroType: 'work' });
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.pomodoroRunning, state.pomodoroTime]);

  const mins = Math.floor(state.pomodoroTime / 60);
  const secs = state.pomodoroTime % 60;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pomodoro Timer">
      <div className="text-center py-4">
        <div className={`text-6xl font-mono font-bold mb-4 ${state.pomodoroType === 'work' ? 'text-red-500' : 'text-green-500'}`}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <div className="text-sm text-gray-500 mb-4">{state.pomodoroType === 'work' ? '🎯 Focus Time' : '☕ Break Time'}</div>
        <div className="flex gap-2 justify-center mb-4">
          <button onClick={() => dispatch({ type: 'TOGGLE_POMODORO' })}
            className={`px-4 py-2 text-sm rounded ${state.pomodoroRunning ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {state.pomodoroRunning ? '⏸ Pause' : '▶ Start'}
          </button>
          <button onClick={() => { dispatch({ type: 'TOGGLE_POMODORO' }); dispatch({ type: 'SET_POMODORO_TYPE', pomodoroType: state.pomodoroType }); }}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300">🔄 Reset</button>
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={() => { dispatch({ type: 'SET_POMODORO_TYPE', pomodoroType: 'work' }); dispatch({ type: 'TOGGLE_POMODORO' }); }}
            className={`px-3 py-1 text-xs rounded ${state.pomodoroType === 'work' ? 'bg-red-100 text-red-700' : 'bg-gray-100 dark:bg-gray-700'}`}>25 min Work</button>
          <button onClick={() => { dispatch({ type: 'SET_POMODORO_TYPE', pomodoroType: 'break' }); dispatch({ type: 'TOGGLE_POMODORO' }); }}
            className={`px-3 py-1 text-xs rounded ${state.pomodoroType === 'break' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-700'}`}>5 min Break</button>
        </div>
      </div>
    </Modal>
  );
};

// ── TOC Modal ───────────────────────────────────────────────
export const TOCModal: React.FC<{ isOpen: boolean; onClose: () => void; content: string; editorRef: React.RefObject<HTMLTextAreaElement> }> = ({ isOpen, onClose, content, editorRef }) => {
  const headings = useMemo(() => {
    const lines = content.split('\n');
    return lines
      .map((line, idx) => {
        const match = line.match(/^(#{1,6})\s+(.+)/);
        if (match) return { level: match[1].length, text: match[2], line: idx };
        return null;
      })
      .filter(Boolean) as { level: number; text: string; line: number }[];
  }, [content]);

  const scrollToLine = (line: number) => {
    if (editorRef.current) {
      const lines = content.substring(0, content.split('\n').slice(0, line).join('\n').length).split('\n').length;
      const lineHeight = 14 * 1.6;
      editorRef.current.scrollTop = lines * lineHeight;
      editorRef.current.focus();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Table of Contents">
      {headings.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-4">No headings found. Use # for headings.</p>
      ) : (
        <div className="space-y-1">
          {headings.map((h, i) => (
            <button key={i} onClick={() => scrollToLine(h.line)}
              className="w-full text-left px-2 py-1.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors flex items-center gap-2"
              style={{ paddingLeft: `${(h.level - 1) * 16 + 8}px` }}>
              <span className="text-[10px] text-gray-400">H{h.level}</span>
              <span className="text-gray-700 dark:text-gray-200 truncate">{h.text}</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
};
