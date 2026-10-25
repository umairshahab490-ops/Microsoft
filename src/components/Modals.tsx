import React, { useState } from 'react';
import { X, Download, FileText, Code, File, Moon, Sun, Hash, WrapText } from 'lucide-react';
import { Note } from '../types';
import { exportNote, exportAllNotes, TEMPLATES } from '../utils';

// ── Modal wrapper ────────────────────────────────────────────
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }> = ({ isOpen, onClose, title, children, wide }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className={`relative bg-white dark:bg-[#2d2d2d] rounded-lg shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-md'} w-full max-h-[80vh] overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(80vh-60px)] p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// ── Export Modal ──────────────────────────────────────────────
export const ExportModal: React.FC<{
  isOpen: boolean; onClose: () => void; note: Note | null; allNotes: Note[];
}> = ({ isOpen, onClose, note, allNotes }) => {
  if (!note) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Notes">
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Current Note: {note.title}</h3>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => { exportNote(note, 'md'); onClose(); }} className="flex flex-col items-center gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <FileText size={24} className="text-blue-600" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Markdown</span>
              <span className="text-[10px] text-gray-400">.md</span>
            </button>
            <button onClick={() => { exportNote(note, 'html'); onClose(); }} className="flex flex-col items-center gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <Code size={24} className="text-green-600" />
              <span className="text-xs text-gray-600 dark:text-gray-300">HTML</span>
              <span className="text-[10px] text-gray-400">.html</span>
            </button>
            <button onClick={() => { exportNote(note, 'txt'); onClose(); }} className="flex flex-col items-center gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <File size={24} className="text-orange-600" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Plain Text</span>
              <span className="text-[10px] text-gray-400">.txt</span>
            </button>
          </div>
        </div>
        <hr className="dark:border-gray-600" />
        <div>
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">All Notes</h3>
          <button onClick={() => { exportAllNotes(allNotes); onClose(); }} className="flex items-center gap-2 w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Download size={20} className="text-[#2b579a]" />
            <div className="text-left">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Export All as Markdown</span>
              <span className="block text-[10px] text-gray-400">{allNotes.length} notes combined into one file</span>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Templates Modal ──────────────────────────────────────────
export const TemplatesModal: React.FC<{
  isOpen: boolean; onClose: () => void; onApply: (template: Partial<Note>) => void;
}> = ({ isOpen, onClose, onApply }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Note Templates">
    <div className="grid grid-cols-2 gap-3">
      {TEMPLATES.map(t => (
        <button
          key={t.name}
          onClick={() => { onApply({ title: t.name, content: t.content }); onClose(); }}
          className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-[#2b579a] transition-colors text-center"
        >
          <span className="text-2xl">{t.icon}</span>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{t.name}</span>
        </button>
      ))}
    </div>
  </Modal>
);

// ── Settings Modal ───────────────────────────────────────────
export const SettingsModal: React.FC<{
  isOpen: boolean; onClose: () => void;
  isDark: boolean; onToggleDark: () => void;
  fontSize: number; onFontSizeChange: (s: number) => void;
  fontFamily: string; onFontFamilyChange: (f: string) => void;
  showLineNumbers: boolean; onToggleLineNumbers: () => void;
  wordWrap: boolean; onToggleWordWrap: () => void;
}> = ({ isOpen, onClose, isDark, onToggleDark, fontSize, onFontSizeChange, fontFamily, onFontFamilyChange, showLineNumbers, onToggleLineNumbers, wordWrap, onToggleWordWrap }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Settings">
    <div className="space-y-4">
      {/* Theme */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isDark ? <Moon size={16} className="text-blue-400" /> : <Sun size={16} className="text-yellow-500" />}
          <span className="text-sm text-gray-700 dark:text-gray-200">Dark Mode</span>
        </div>
        <button onClick={onToggleDark} className={`w-10 h-5 rounded-full transition-colors ${isDark ? 'bg-[#2b579a]' : 'bg-gray-300'} relative`}>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Font */}
      <div>
        <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Font Family</label>
        <select value={fontFamily} onChange={e => onFontFamilyChange(e.target.value)} className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-[#333] dark:text-white">
          {['Segoe UI', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Consolas', 'Monaco'].map(f => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Font Size: {fontSize}px</label>
        <input type="range" min={10} max={32} value={fontSize} onChange={e => onFontSizeChange(Number(e.target.value))} className="mt-1 w-full accent-[#2b579a]" />
      </div>

      {/* Line Numbers */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash size={16} className="text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-200">Line Numbers</span>
        </div>
        <button onClick={onToggleLineNumbers} className={`w-10 h-5 rounded-full transition-colors ${showLineNumbers ? 'bg-[#2b579a]' : 'bg-gray-300'} relative`}>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showLineNumbers ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Word Wrap */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WrapText size={16} className="text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-200">Word Wrap</span>
        </div>
        <button onClick={onToggleWordWrap} className={`w-10 h-5 rounded-full transition-colors ${wordWrap ? 'bg-[#2b579a]' : 'bg-gray-300'} relative`}>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${wordWrap ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* About */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-400 text-center">Word Notes Pro v2.0 — Lightweight Markdown Notes</p>
      </div>
    </div>
  </Modal>
);

// ── Shortcuts Modal ──────────────────────────────────────────
export const ShortcutsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const shortcuts = [
    ['Ctrl + N', 'New note'],
    ['Ctrl + S', 'Force save'],
    ['Ctrl + P', 'Toggle preview'],
    ['Ctrl + F', 'Focus search'],
    ['Ctrl + H', 'Find & Replace'],
    ['Ctrl + D', 'Delete note'],
    ['Ctrl + E', 'Export note'],
    ['Ctrl + \\', 'Toggle sidebar'],
    ['Ctrl + Shift + F', 'Fullscreen mode'],
    ['Ctrl + ↑/↓', 'Navigate notes'],
    ['Ctrl + Shift + D', 'Duplicate note'],
    ['Ctrl + Z', 'Undo'],
    ['Ctrl + Y', 'Redo'],
    ['Ctrl + B', 'Bold'],
    ['Ctrl + I', 'Italic'],
    ['Tab', 'Indent'],
    ['Shift + Tab', 'Outdent'],
    ['Escape', 'Close modal / Exit fullscreen'],
  ];
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
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
