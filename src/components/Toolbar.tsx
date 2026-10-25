import { useCallback } from 'react';

interface ToolbarProps {
  onInsertMarkdown: (syntax: string) => void;
  disabled?: boolean;
}

interface ToolbarButton {
  icon: string;
  label: string;
  syntax: string;
  group: string;
}

const toolbarButtons: ToolbarButton[] = [
  // Text formatting group
  { icon: 'B', label: 'Bold', syntax: 'bold', group: 'format' },
  { icon: 'I', label: 'Italic', syntax: 'italic', group: 'format' },
  { icon: 'S', label: 'Strikethrough', syntax: 'strikethrough', group: 'format' },
  
  // Headings group
  { icon: 'H1', label: 'Heading 1', syntax: 'h1', group: 'heading' },
  { icon: 'H2', label: 'Heading 2', syntax: 'h2', group: 'heading' },
  { icon: 'H3', label: 'Heading 3', syntax: 'h3', group: 'heading' },
  
  // Lists group
  { icon: '•', label: 'Bullet List', syntax: 'ul', group: 'list' },
  { icon: '1.', label: 'Numbered List', syntax: 'ol', group: 'list' },
  { icon: '☐', label: 'Task List', syntax: 'task', group: 'list' },
  
  // Insert group
  { icon: '<>', label: 'Code', syntax: 'code', group: 'insert' },
  { icon: '`', label: 'Inline Code', syntax: 'inlinecode', group: 'insert' },
  { icon: '🔗', label: 'Link', syntax: 'link', group: 'insert' },
  { icon: '❝', label: 'Quote', syntax: 'quote', group: 'insert' },
  { icon: '—', label: 'Horizontal Rule', syntax: 'hr', group: 'insert' },
  { icon: '⊞', label: 'Table', syntax: 'table', group: 'insert' },
];

export default function Toolbar({ onInsertMarkdown, disabled }: ToolbarProps) {
  const handleClick = useCallback((syntax: string) => {
    if (!disabled) {
      onInsertMarkdown(syntax);
    }
  }, [onInsertMarkdown, disabled]);

  // Group buttons
  const groups = Array.from(new Set(toolbarButtons.map(b => b.group)));

  return (
    <div className="glass-panel rounded-2xl px-3 py-2 flex items-center gap-2 overflow-x-auto">
      {groups.map((group, groupIndex) => (
        <div key={group} className="flex items-center gap-1">
          {toolbarButtons
            .filter(b => b.group === group)
            .map((button) => (
              <button
                key={button.syntax}
                onClick={() => handleClick(button.syntax)}
                disabled={disabled}
                title={button.label}
                className={`
                  tap-target px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${disabled 
                    ? 'opacity-40 cursor-not-allowed text-gray-400' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-purple-900/30 btn-lift'
                  }
                `}
              >
                {button.icon}
              </button>
            ))}
          {groupIndex < groups.length - 1 && (
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}
