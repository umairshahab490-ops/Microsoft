import React from 'react';
import {
  FilePlus,
  Trash2,
  Eye,
  Edit3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Code,
  Link,
  Minus,
  Quote,
  CheckSquare,
} from 'lucide-react';

interface ToolbarProps {
  isPreview: boolean;
  onTogglePreview: () => void;
  onNewNote: () => void;
  onDeleteNote: () => void;
  onInsertMarkdown: (syntax: string) => void;
  hasActiveNote: boolean;
}

const ToolbarButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}> = React.memo(({ icon, label, onClick, active, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={`p-1.5 rounded hover:bg-blue-100 transition-colors duration-100 ${
      active ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {icon}
  </button>
));

const Divider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

const Toolbar: React.FC<ToolbarProps> = ({
  isPreview,
  onTogglePreview,
  onNewNote,
  onDeleteNote,
  onInsertMarkdown,
  hasActiveNote,
}) => {
  return (
    <div className="bg-[#f3f3f3] border-b border-gray-300 select-none">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#2b579a]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">W</span>
          </div>
          <span className="text-white text-sm font-medium">Word Notes</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewNote}
            className="flex items-center gap-1 px-2 py-0.5 text-xs text-white/90 hover:bg-white/10 rounded transition-colors"
          >
            <FilePlus size={14} />
            <span className="hidden sm:inline">New</span>
          </button>
          <button
            onClick={onDeleteNote}
            disabled={!hasActiveNote}
            className="flex items-center gap-1 px-2 py-0.5 text-xs text-white/90 hover:bg-white/10 rounded transition-colors disabled:opacity-40"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Ribbon */}
      <div className="flex items-center px-2 py-1 gap-0.5 overflow-x-auto">
        {/* File operations */}
        <ToolbarButton
          icon={<FilePlus size={16} />}
          label="New Note (Ctrl+N)"
          onClick={onNewNote}
        />
        <ToolbarButton
          icon={<Trash2 size={16} />}
          label="Delete Note (Ctrl+D)"
          onClick={onDeleteNote}
          disabled={!hasActiveNote}
        />

        <Divider />

        {/* View */}
        <ToolbarButton
          icon={isPreview ? <Edit3 size={16} /> : <Eye size={16} />}
          label={isPreview ? 'Edit Mode (Ctrl+P)' : 'Preview Mode (Ctrl+P)'}
          onClick={onTogglePreview}
          active={isPreview}
          disabled={!hasActiveNote}
        />

        <Divider />

        {/* Formatting */}
        <ToolbarButton
          icon={<Bold size={16} />}
          label="Bold"
          onClick={() => onInsertMarkdown('bold')}
          disabled={!hasActiveNote || isPreview}
        />
        <ToolbarButton
          icon={<Italic size={16} />}
          label="Italic"
          onClick={() => onInsertMarkdown('italic')}
          disabled={!hasActiveNote || isPreview}
        />
        <ToolbarButton
          icon={<Heading1 size={16} />}
          label="Heading 1"
          onClick={() => onInsertMarkdown('h1')}
          disabled={!hasActiveNote || isPreview}
        />
        <ToolbarButton
          icon={<Heading2 size={16} />}
          label="Heading 2"
          onClick={() => onInsertMarkdown('h2')}
          disabled={!hasActiveNote || isPreview}
        />

        <Divider />

        {/* Lists */}
        <ToolbarButton
          icon={<List size={16} />}
          label="Bullet List"
          onClick={() => onInsertMarkdown('ul')}
          disabled={!hasActiveNote || isPreview}
        />
        <ToolbarButton
          icon={<ListOrdered size={16} />}
          label="Numbered List"
          onClick={() => onInsertMarkdown('ol')}
          disabled={!hasActiveNote || isPreview}
        />
        <ToolbarButton
          icon={<CheckSquare size={16} />}
          label="Task List"
          onClick={() => onInsertMarkdown('task')}
          disabled={!hasActiveNote || isPreview}
        />

        <Divider />

        {/* Insert */}
        <ToolbarButton
          icon={<Code size={16} />}
          label="Code Block"
          onClick={() => onInsertMarkdown('code')}
          disabled={!hasActiveNote || isPreview}
        />
        <ToolbarButton
          icon={<Link size={16} />}
          label="Link"
          onClick={() => onInsertMarkdown('link')}
          disabled={!hasActiveNote || isPreview}
        />
        <ToolbarButton
          icon={<Quote size={16} />}
          label="Blockquote"
          onClick={() => onInsertMarkdown('quote')}
          disabled={!hasActiveNote || isPreview}
        />
        <ToolbarButton
          icon={<Minus size={16} />}
          label="Horizontal Rule"
          onClick={() => onInsertMarkdown('hr')}
          disabled={!hasActiveNote || isPreview}
        />
      </div>
    </div>
  );
};

export default Toolbar;
