import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Search, X, Pin, Star, Plus, ChevronDown, ChevronRight, FolderOpen, Tag, MoreVertical, ArrowUpDown, Archive, Trash2, CheckSquare, Square } from 'lucide-react';
import { Note, Folder, AppState, SortBy, SortDir } from '../types';
import { formatDate } from '../utils';

interface SidebarProps {
  notes: Note[];
  trash: Note[];
  folders: Folder[];
  allTags: string[];
  state: AppState;
  onToggle: () => void;
  onSearchChange: (q: string) => void;
  onSelectNote: (id: string) => void;
  onSelectFolder: (id: string) => void;
  onSelectTag: (tag: string | null) => void;
  onToggleFavorites: () => void;
  onToggleArchived: () => void;
  onToggleTrash: () => void;
  onSortChange: (by: SortBy, dir: SortDir) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (id: string) => void;
  onRestoreNote: (id: string) => void;
  onEmptyTrash: () => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkArchive: () => void;
  onBulkTag: (tag: string) => void;
}

const NoteItem: React.FC<{
  note: Note; isActive: boolean; isSelected: boolean;
  onSelect: () => void; onTogglePin: () => void; onToggleFavorite: () => void;
  onDelete: () => void; onDuplicate: () => void; onToggleSelect: () => void;
}> = React.memo(({ note, isActive, isSelected, onSelect, onTogglePin, onToggleFavorite, onDelete, onDuplicate, onToggleSelect }) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div onClick={onSelect}
      className={`group relative px-3 py-2 cursor-pointer border-b border-gray-50 dark:border-gray-700/50 transition-all duration-100 ${
        isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-l-[3px] border-l-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-[3px] border-l-transparent'
      }`}>
      <div className="flex items-start gap-2">
        <button onClick={(e) => { e.stopPropagation(); onToggleSelect(); }} className="mt-0.5 flex-shrink-0">
          {isSelected ? <CheckSquare size={12} className="text-blue-600" /> : <Square size={12} className="text-gray-300" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            {note.pinned && <Pin size={10} className="text-blue-600 flex-shrink-0" />}
            {note.favorite && <Star size={10} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />}
            <h3 className={`text-sm font-medium truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
              {note.title || 'Untitled'}
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {note.content.replace(/[#*`>\-\[\]]/g, '').slice(0, 80) || 'Empty note'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-gray-400">{formatDate(note.updatedAt)}</span>
            {note.tags.length > 0 && (
              <div className="flex gap-1">
                {note.tags.slice(0, 2).map(t => (
                  <span key={t} className="text-[9px] px-1 py-0 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded">{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <MoreVertical size={12} className="text-gray-400" />
        </button>
      </div>
      {showMenu && (
        <div className="absolute right-2 top-8 z-50 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg py-1 min-w-[140px]">
          <button onClick={(e) => { e.stopPropagation(); onTogglePin(); setShowMenu(false); }} className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2"><Pin size={12} /> {note.pinned ? 'Unpin' : 'Pin'}</button>
          <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(); setShowMenu(false); }} className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2"><Star size={12} /> {note.favorite ? 'Unfavorite' : 'Favorite'}</button>
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); setShowMenu(false); }} className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2"><Plus size={12} /> Duplicate</button>
          <hr className="my-1 dark:border-gray-600" />
          <button onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }} className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"><Trash2 size={12} /> Delete</button>
        </div>
      )}
    </div>
  );
});

const Sidebar: React.FC<SidebarProps> = (props) => {
  const { notes, trash, folders, allTags, state, onToggle, onSearchChange, onSelectNote, onSelectFolder, onSelectTag, onToggleFavorites, onToggleArchived, onToggleTrash, onSortChange, onCreateFolder, onDeleteFolder, onTogglePin, onToggleFavorite, onDeleteNote, onDuplicateNote, onRestoreNote, onEmptyTrash, onToggleSelect, onSelectAll, onClearSelection, onBulkDelete, onBulkArchive, onBulkTag } = props;
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedSections, setExpandedSections] = useState({ folders: true, tags: true });
  const [bulkTagInput, setBulkTagInput] = useState('');
  const activeNoteRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeNoteRef.current) activeNoteRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [state.activeNoteId]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notes.length };
    notes.forEach(n => { counts[n.folderId] = (counts[n.folderId] || 0) + 1; });
    return counts;
  }, [notes]);

  const displayNotes = state.showTrash ? trash : notes;

  return (
    <>
      <button onClick={onToggle} className="md:hidden fixed bottom-4 left-4 z-50 p-3 rounded-full shadow-lg text-white" style={{ background: state.accentColor }}>
        <FolderOpen size={18} />
      </button>
      {state.sidebarOpen && <div className="md:hidden fixed inset-0 bg-black/20 z-30" onClick={onToggle} />}
      <aside className={`fixed md:relative z-40 h-full w-[280px] bg-white dark:bg-[#252525] border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-200 ${
        state.sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Search */}
        <div className="p-2 border-b border-gray-100 dark:border-gray-700">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={state.searchQuery} onChange={e => onSearchChange(e.target.value)}
              placeholder="Search notes... (Ctrl+F)" className="w-full pl-8 pr-7 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 bg-gray-50 dark:bg-gray-800 dark:text-white" id="search-input" />
            {state.searchQuery && <button onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13} /></button>}
          </div>
        </div>

        {/* Quick filters */}
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 dark:border-gray-700">
          <button onClick={onToggleFavorites} className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded ${state.showFavorites ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            <Star size={11} className={state.showFavorites ? 'fill-yellow-500' : ''} /> Favorites
          </button>
          <button onClick={onToggleArchived} className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded ${state.showArchived ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            <Archive size={11} /> Archived
          </button>
          <button onClick={onToggleTrash} className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded ${state.showTrash ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            <Trash2 size={11} /> Trash ({trash.length})
          </button>
          <div className="flex-1" />
          <div className="relative">
            <button onClick={() => setShowSortMenu(!showSortMenu)} className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
              <ArrowUpDown size={11} />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg py-1 z-50 min-w-[140px]">
                {(['updatedAt', 'createdAt', 'title'] as const).map(s => (
                  <button key={s} onClick={() => { onSortChange(s, state.sortDir); setShowSortMenu(false); }}
                    className={`w-full px-3 py-1 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-600 ${state.sortBy === s ? 'text-blue-600 font-medium' : ''}`}>
                    {s === 'updatedAt' ? 'Last modified' : s === 'createdAt' ? 'Date created' : 'Title'}
                  </button>
                ))}
                <hr className="my-1 dark:border-gray-600" />
                <button onClick={() => { onSortChange(state.sortBy, state.sortDir === 'asc' ? 'desc' : 'asc'); setShowSortMenu(false); }}
                  className="w-full px-3 py-1 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-600">
                  {state.sortDir === 'asc' ? '↓ Ascending' : '↑ Descending'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bulk actions bar */}
        {state.selectedNoteIds.length > 0 && !state.showTrash && (
          <div className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
            <span className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">{state.selectedNoteIds.length} selected</span>
            <div className="flex-1" />
            <button onClick={onBulkArchive} className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50">Archive</button>
            <button onClick={onBulkDelete} className="px-1.5 py-0.5 text-[10px] bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 rounded hover:bg-red-100">Delete</button>
            <button onClick={onClearSelection} className="px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Clear</button>
          </div>
        )}

        {/* Folders */}
        {!state.showTrash && (
          <div className="border-b border-gray-100 dark:border-gray-700">
            <button onClick={() => setExpandedSections(p => ({ ...p, folders: !p.folders }))}
              className="w-full flex items-center gap-1 px-3 py-1.5 text-[10px] text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800">
              {expandedSections.folders ? <ChevronDown size={12} /> : <ChevronRight size={12} />} Folders
            </button>
            {expandedSections.folders && (
              <div className="px-1 pb-1">
                {folders.map(f => (
                  <button key={f.id} onClick={() => onSelectFolder(f.id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                      state.activeFolderId === f.id && !state.activeTag && !state.showFavorites && !state.showArchived
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}>
                    <span className="text-sm">{f.icon}</span>
                    <span className="flex-1 text-left truncate">{f.name}</span>
                    <span className="text-[10px] text-gray-400">{folderCounts[f.id] || 0}</span>
                  </button>
                ))}
                {showNewFolder ? (
                  <div className="flex items-center gap-1 px-2 py-1">
                    <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { onCreateFolder(newFolderName.trim()); setNewFolderName(''); setShowNewFolder(false); } if (e.key === 'Escape') setShowNewFolder(false); }}
                      placeholder="Folder name..." className="flex-1 text-xs px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500" autoFocus />
                    <button onClick={() => { onCreateFolder(newFolderName.trim()); setNewFolderName(''); setShowNewFolder(false); }} className="text-blue-600 text-xs font-medium">Add</button>
                  </div>
                ) : (
                  <button onClick={() => setShowNewFolder(true)} className="w-full flex items-center gap-2 px-3 py-1 text-xs text-gray-400 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <Plus size={12} /> New folder
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {allTags.length > 0 && !state.showTrash && (
          <div className="border-b border-gray-100 dark:border-gray-700">
            <button onClick={() => setExpandedSections(p => ({ ...p, tags: !p.tags }))}
              className="w-full flex items-center gap-1 px-3 py-1.5 text-[10px] text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800">
              {expandedSections.tags ? <ChevronDown size={12} /> : <ChevronRight size={12} />} Tags
            </button>
            {expandedSections.tags && (
              <div className="px-2 pb-2 flex flex-wrap gap-1">
                {allTags.map(tag => (
                  <button key={tag} onClick={() => onSelectTag(state.activeTag === tag ? null : tag)}
                    className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                      state.activeTag === tag ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`} style={state.activeTag === tag ? { background: state.accentColor } : {}}>
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
              {state.showTrash ? `${trash.length} in trash` : `${displayNotes.length} note${displayNotes.length !== 1 ? 's' : ''}`}
            </span>
            {state.showTrash && trash.length > 0 && (
              <button onClick={onEmptyTrash} className="text-[10px] text-red-500 hover:text-red-700">Empty Trash</button>
            )}
            {!state.showTrash && displayNotes.length > 0 && (
              <button onClick={onSelectAll} className="text-[10px] text-blue-600 hover:text-blue-800">Select All</button>
            )}
          </div>
          {displayNotes.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-xs">
              {state.showTrash ? 'Trash is empty' : state.searchQuery ? 'No matching notes' : 'No notes'}
            </div>
          ) : state.showTrash ? (
            displayNotes.map(note => (
              <div key={note.id} className="px-3 py-2 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm text-gray-600 dark:text-gray-300 truncate">{note.title || 'Untitled'}</h3>
                  <p className="text-[10px] text-gray-400">{formatDate(note.updatedAt)}</p>
                </div>
                <button onClick={() => onRestoreNote(note.id)} className="px-2 py-1 text-[10px] text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">Restore</button>
              </div>
            ))
          ) : (
            displayNotes.map(note => (
              <div key={note.id} ref={note.id === state.activeNoteId ? activeNoteRef : undefined}>
                <NoteItem
                  note={note} isActive={note.id === state.activeNoteId} isSelected={state.selectedNoteIds.includes(note.id)}
                  onSelect={() => onSelectNote(note.id)}
                  onTogglePin={() => onTogglePin(note.id)}
                  onToggleFavorite={() => onToggleFavorite(note.id)}
                  onDelete={() => onDeleteNote(note.id)}
                  onDuplicate={() => onDuplicateNote(note.id)}
                  onToggleSelect={() => onToggleSelect(note.id)}
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
