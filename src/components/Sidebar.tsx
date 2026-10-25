import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Search, X, Pin, Star, Plus, ChevronDown, ChevronRight, FolderOpen, Tag, MoreVertical, ArrowUpDown } from 'lucide-react';
import { Note, Folder } from '../types';
import { formatDate } from '../utils';

interface SidebarProps {
  notes: Note[];
  folders: Folder[];
  allTags: string[];
  activeId: string;
  activeFolderId: string;
  activeTag: string | null;
  showFavorites: boolean;
  searchQuery: string;
  sortBy: string;
  sortDir: string;
  isOpen: boolean;
  onToggle: () => void;
  onSearchChange: (q: string) => void;
  onSelectNote: (id: string) => void;
  onSelectFolder: (id: string) => void;
  onSelectTag: (tag: string | null) => void;
  onToggleFavorites: () => void;
  onSortChange: (by: string, dir: string) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (id: string) => void;
}

const FolderItem: React.FC<{
  folder: Folder;
  isActive: boolean;
  noteCount: number;
  onSelect: () => void;
  onDelete: () => void;
}> = React.memo(({ folder, isActive, noteCount, onSelect, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className="relative group">
      <button
        onClick={onSelect}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
          isActive ? 'bg-blue-50 text-[#2b579a] font-medium' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <span className="text-sm">{folder.icon}</span>
        <span className="flex-1 text-left truncate">{folder.name}</span>
        <span className="text-[10px] text-gray-400">{noteCount}</span>
        {folder.id !== 'all' && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-0.5 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={12} />
          </button>
        )}
      </button>
      {showMenu && folder.id !== 'all' && (
        <div className="absolute right-0 top-full z-50 bg-white border border-gray-200 rounded shadow-lg py-1 min-w-[120px]">
          <button
            onClick={() => { onDelete(); setShowMenu(false); }}
            className="w-full px-3 py-1 text-left text-xs text-red-600 hover:bg-red-50"
          >
            Delete folder
          </button>
        </div>
      )}
    </div>
  );
});

const NoteItem: React.FC<{
  note: Note;
  isActive: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = React.memo(({ note, isActive, onSelect, onTogglePin, onToggleFavorite, onDelete, onDuplicate }) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div
      onClick={onSelect}
      className={`group relative px-3 py-2 cursor-pointer border-b border-gray-50 transition-all duration-100 ${
        isActive
          ? 'bg-[#e8f0fe] border-l-[3px] border-l-[#2b579a]'
          : 'hover:bg-gray-50 border-l-[3px] border-l-transparent'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            {note.pinned && <Pin size={10} className="text-[#2b579a] flex-shrink-0" />}
            {note.favorite && <Star size={10} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />}
            <h3 className={`text-sm font-medium truncate ${isActive ? 'text-[#2b579a]' : 'text-gray-800'}`}>
              {note.title || 'Untitled'}
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {note.content.replace(/[#*`>\-\[\]]/g, '').slice(0, 80) || 'Empty note'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-gray-400">{formatDate(note.updatedAt)}</span>
            {note.tags.length > 0 && (
              <div className="flex gap-1">
                {note.tags.slice(0, 2).map(t => (
                  <span key={t} className="text-[9px] px-1 py-0 bg-blue-50 text-blue-600 rounded">{t}</span>
                ))}
                {note.tags.length > 2 && <span className="text-[9px] text-gray-400">+{note.tags.length - 2}</span>}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
          <MoreVertical size={12} className="text-gray-400" />
        </button>
      </div>
      {showMenu && (
        <div className="absolute right-2 top-8 z-50 bg-white border border-gray-200 rounded shadow-lg py-1 min-w-[140px]">
          <button onClick={(e) => { e.stopPropagation(); onTogglePin(); setShowMenu(false); }} className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center gap-2">
            <Pin size={12} /> {note.pinned ? 'Unpin' : 'Pin to top'}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(); setShowMenu(false); }} className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center gap-2">
            <Star size={12} /> {note.favorite ? 'Unfavorite' : 'Favorite'}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); setShowMenu(false); }} className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 flex items-center gap-2">
            <Plus size={12} /> Duplicate
          </button>
          <hr className="my-1" />
          <button onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }} className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
            <X size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  );
});

const Sidebar: React.FC<SidebarProps> = ({
  notes, folders, allTags, activeId, activeFolderId, activeTag, showFavorites,
  searchQuery, sortBy, sortDir, isOpen, onToggle, onSearchChange, onSelectNote,
  onSelectFolder, onSelectTag, onToggleFavorites, onSortChange, onCreateFolder,
  onDeleteFolder, onTogglePin, onToggleFavorite, onDeleteNote, onDuplicateNote,
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedSections, setExpandedSections] = useState({ folders: true, tags: true });
  const activeNoteRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeNoteRef.current) {
      activeNoteRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeId]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notes.length };
    notes.forEach(n => { counts[n.folderId] = (counts[n.folderId] || 0) + 1; });
    return counts;
  }, [notes]);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section as keyof typeof prev] }));
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={onToggle}
        className="md:hidden fixed bottom-4 left-4 z-50 p-3 bg-[#2b579a] text-white rounded-full shadow-lg"
        aria-label="Toggle sidebar"
      >
        <FolderOpen size={18} />
      </button>

      {/* Overlay */}
      {isOpen && <div className="md:hidden fixed inset-0 bg-black/20 z-30" onClick={onToggle} />}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 h-full w-[280px] bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Search */}
        <div className="p-2 border-b border-gray-100">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search notes... (Ctrl+F)"
              className="w-full pl-8 pr-7 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#2b579a] bg-gray-50"
              id="search-input"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Quick filters */}
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100">
          <button
            onClick={onToggleFavorites}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded transition-colors ${
              showFavorites ? 'bg-yellow-50 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Star size={11} className={showFavorites ? 'fill-yellow-500' : ''} /> Favorites
          </button>
          <div className="flex-1" />
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-50 rounded"
            >
              <ArrowUpDown size={11} /> Sort
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 min-w-[140px]">
                {(['updatedAt', 'createdAt', 'title'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => { onSortChange(s, sortDir); setShowSortMenu(false); }}
                    className={`w-full px-3 py-1 text-left text-xs hover:bg-gray-50 ${sortBy === s ? 'text-[#2b579a] font-medium' : ''}`}
                  >
                    {s === 'updatedAt' ? 'Last modified' : s === 'createdAt' ? 'Date created' : 'Title'}
                  </button>
                ))}
                <hr className="my-1" />
                <button
                  onClick={() => { onSortChange(sortBy, sortDir === 'asc' ? 'desc' : 'asc'); setShowSortMenu(false); }}
                  className="w-full px-3 py-1 text-left text-xs hover:bg-gray-50"
                >
                  {sortDir === 'asc' ? '↓ Ascending' : '↑ Descending'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Folders */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection('folders')}
            className="w-full flex items-center gap-1 px-3 py-1.5 text-[10px] text-gray-400 uppercase tracking-wider hover:bg-gray-50"
          >
            {expandedSections.folders ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Folders
          </button>
          {expandedSections.folders && (
            <div className="px-1 pb-1">
              {folders.map(f => (
                <FolderItem
                  key={f.id}
                  folder={f}
                  isActive={activeFolderId === f.id && !activeTag && !showFavorites}
                  noteCount={folderCounts[f.id] || 0}
                  onSelect={() => onSelectFolder(f.id)}
                  onDelete={() => onDeleteFolder(f.id)}
                />
              ))}
              {showNewFolder ? (
                <div className="flex items-center gap-1 px-2 py-1">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowNewFolder(false); }}
                    placeholder="Folder name..."
                    className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-[#2b579a]"
                    autoFocus
                  />
                  <button onClick={handleCreateFolder} className="text-[#2b579a] text-xs font-medium">Add</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewFolder(true)}
                  className="w-full flex items-center gap-2 px-3 py-1 text-xs text-gray-400 hover:text-[#2b579a] hover:bg-gray-50 rounded"
                >
                  <Plus size={12} /> New folder
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('tags')}
              className="w-full flex items-center gap-1 px-3 py-1.5 text-[10px] text-gray-400 uppercase tracking-wider hover:bg-gray-50"
            >
              {expandedSections.tags ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Tags
            </button>
            {expandedSections.tags && (
              <div className="px-2 pb-2 flex flex-wrap gap-1">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => onSelectTag(activeTag === tag ? null : tag)}
                    className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                      activeTag === tag
                        ? 'bg-[#2b579a] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Tag size={8} className="inline mr-0.5" />{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Note list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-1.5 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </span>
          </div>
          {notes.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-xs">
              {searchQuery ? 'No matching notes' : 'No notes in this folder'}
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} ref={note.id === activeId ? activeNoteRef : undefined}>
                <NoteItem
                  note={note}
                  isActive={note.id === activeId}
                  onSelect={() => onSelectNote(note.id)}
                  onTogglePin={() => onTogglePin(note.id)}
                  onToggleFavorite={() => onToggleFavorite(note.id)}
                  onDelete={() => onDeleteNote(note.id)}
                  onDuplicate={() => onDuplicateNote(note.id)}
                />
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
