import { useState, useCallback, useEffect, useRef } from 'react';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import { useNotes } from './hooks/useNotes';

export default function App() {
  const {
    notes,
    activeNote,
    activeId,
    createNote,
    deleteNote,
    updateNote,
    setActiveNote,
  } = useNotes();

  const [isPreview, setIsPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Insert markdown syntax at cursor or wrap selection
  const insertMarkdown = useCallback(
    (syntax: string) => {
      const textarea = editorRef.current;
      if (!textarea || !activeNote) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = activeNote.content;
      const selected = text.substring(start, end);
      let insertion = '';
      let cursorOffset = 0;

      switch (syntax) {
        case 'bold':
          insertion = `**${selected || 'bold text'}**`;
          cursorOffset = selected ? insertion.length : 2;
          break;
        case 'italic':
          insertion = `*${selected || 'italic text'}*`;
          cursorOffset = selected ? insertion.length : 1;
          break;
        case 'h1':
          insertion = `\n# ${selected || 'Heading 1'}\n`;
          cursorOffset = insertion.length;
          break;
        case 'h2':
          insertion = `\n## ${selected || 'Heading 2'}\n`;
          cursorOffset = insertion.length;
          break;
        case 'ul':
          insertion = `\n- ${selected || 'List item'}\n`;
          cursorOffset = insertion.length;
          break;
        case 'ol':
          insertion = `\n1. ${selected || 'List item'}\n`;
          cursorOffset = insertion.length;
          break;
        case 'task':
          insertion = `\n- [ ] ${selected || 'Task item'}\n`;
          cursorOffset = insertion.length;
          break;
        case 'code':
          insertion = selected
            ? `\n\`\`\`\n${selected}\n\`\`\`\n`
            : '\n```\ncode here\n```\n';
          cursorOffset = insertion.length;
          break;
        case 'link':
          insertion = `[${selected || 'link text'}](url)`;
          cursorOffset = selected ? insertion.length : 1;
          break;
        case 'quote':
          insertion = `\n> ${selected || 'Quote text'}\n`;
          cursorOffset = insertion.length;
          break;
        case 'hr':
          insertion = '\n---\n';
          cursorOffset = insertion.length;
          break;
        default:
          return;
      }

      const newContent = text.substring(0, start) + insertion + text.substring(end);
      updateNote(activeNote.id, { content: newContent });

      // Restore cursor position
      requestAnimationFrame(() => {
        textarea.focus();
        const newPos = start + cursorOffset;
        textarea.setSelectionRange(newPos, newPos);
      });
    },
    [activeNote, updateNote]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'n') {
        e.preventDefault();
        createNote();
      } else if (ctrl && e.key === 'p') {
        e.preventDefault();
        if (activeNote) setIsPreview(prev => !prev);
      } else if (ctrl && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if (ctrl && e.key === 'd') {
        e.preventDefault();
        if (activeNote) {
          deleteNote(activeNote.id);
        }
      } else if (e.key === 'ArrowUp' && ctrl) {
        e.preventDefault();
        navigateNotes(-1);
      } else if (e.key === 'ArrowDown' && ctrl) {
        e.preventDefault();
        navigateNotes(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNote, deleteNote, activeNote, notes, activeId]);

  const navigateNotes = useCallback(
    (direction: number) => {
      const currentIndex = notes.findIndex(n => n.id === activeId);
      if (currentIndex === -1) return;
      const newIndex = currentIndex + direction;
      if (newIndex >= 0 && newIndex < notes.length) {
        setActiveNote(notes[newIndex].id);
      }
    },
    [notes, activeId, setActiveNote]
  );

  const handleContentChange = useCallback(
    (content: string) => {
      if (activeNote) {
        updateNote(activeNote.id, { content });
      }
    },
    [activeNote, updateNote]
  );

  const handleTitleChange = useCallback(
    (title: string) => {
      if (activeNote) {
        updateNote(activeNote.id, { title });
      }
    },
    [activeNote, updateNote]
  );

  const handleDeleteNote = useCallback(() => {
    if (activeNote) {
      deleteNote(activeNote.id);
    }
  }, [activeNote, deleteNote]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      {/* Toolbar / Ribbon */}
      <Toolbar
        isPreview={isPreview}
        onTogglePreview={() => setIsPreview(prev => !prev)}
        onNewNote={createNote}
        onDeleteNote={handleDeleteNote}
        onInsertMarkdown={insertMarkdown}
        hasActiveNote={!!activeNote}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          notes={notes}
          activeId={activeId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectNote={(id) => {
            setActiveNote(id);
            setSidebarOpen(false);
          }}
          onNewNote={createNote}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(prev => !prev)}
        />

        {/* Editor */}
        {activeNote ? (
          <Editor
            content={activeNote.content}
            title={activeNote.title}
            isPreview={isPreview}
            onContentChange={handleContentChange}
            onTitleChange={handleTitleChange}
            editorRef={editorRef}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h2 className="text-lg font-medium text-gray-600 mb-2">No note selected</h2>
              <p className="text-sm text-gray-400 mb-4">Create a new note to get started</p>
              <button
                onClick={createNote}
                className="px-4 py-2 bg-[#2b579a] text-white text-sm rounded hover:bg-[#1e3f6f] transition-colors"
              >
                New Note (Ctrl+N)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
