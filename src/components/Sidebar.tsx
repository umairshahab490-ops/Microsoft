import React, { useMemo, useRef, useEffect } from 'react';
import { Search, FileText, X } from 'lucide-react';
import { Note } from '../types';

interface SidebarProps {
  notes: Note[];
  activeId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

function formatDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const NoteItem: React.FC<{
  note: Note;
  isActive: boolean;
  onSelect: (id: string) => void;
  noteRef: (el: HTMLDivElement | null) => void;
}> = React.memo(({ note, isActive, onSelect, noteRef }) => (
  <div
    ref={noteRef}
    onClick={() => onSelect(note.id)}
    className={`px-3 py-2.5 cursor-pointer border-b border-gray-100 transition-colors duration-100 ${
      isActive
        ? 'bg-[#e8f0fe] border-l-3 border-l-[#2b579a]'
        : 'hover:bg-gray-50'
    }`}
    role="option"
    aria-selected={isActive}
    tabIndex={-1}
  >
    <div className="flex items-center gap-2">
      <FileText size={14} className={isActive ? 'text-[#2b579a]' : 'text-gray-400'} />
      <h3
        className={`text-sm font-medium truncate flex-1 ${
          isActive ? 'text-[#2b579a]' : 'text-gray-800'
        }`}
      >
        {note.title || 'Untitled'}
      </h3>
    </div>
    <p className="text-xs text-gray-500 mt-1 truncate pl-6">
      {note.content.replace(/[#*`>\-\[\]]/g, '').slice(0, 60) || 'Empty note'}
    </p>
    <p className="text-[10px] text-gray-400 mt-0.5 pl-6">
      {formatDate(note.updatedAt)}
    </p>
  </div>
));

const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeId,
  searchQuery,
  onSearchChange,
  onSelectNote,
  isOpen,
  onToggle,
}) => {
  const searchRef = useRef<HTMLInputElement>(null);
  const activeNoteRef = useRef<HTMLDivElement | null>(null);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  useEffect(() => {
    if (activeNoteRef.current) {
      activeNoteRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeId]);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-12 left-2 z-50 p-2 bg-[#2b579a] text-white rounded shadow-lg"
        aria-label="Toggle sidebar"
      >
        <FileText size={18} />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Search */}
        <div className="p-2 border-b border-gray-200">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search notes... (Ctrl+F)"
              className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#2b579a] focus:ring-1 focus:ring-[#2b579a]/20 bg-gray-50"
              id="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-1.5 px-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">
              {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto" role="listbox">
          {filteredNotes.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              {searchQuery ? 'No matching notes' : 'No notes yet'}
            </div>
          ) : (
            filteredNotes.map(note => (
              <NoteItem
                key={note.id}
                note={note}
                isActive={note.id === activeId}
                onSelect={onSelectNote}
                noteRef={note.id === activeId ? (el) => { activeNoteRef.current = el; } : () => {}}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
