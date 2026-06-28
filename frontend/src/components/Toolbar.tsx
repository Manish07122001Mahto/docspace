import type { Editor } from '@tiptap/react';
import { Bold, Heading1, Heading2, Italic, List, ListOrdered, Underline } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ToolbarProps = {
  editor: Editor | null;
};

export function Toolbar({ editor }: ToolbarProps) {
  const commands = [
    {
      label: 'Bold',
      icon: Bold,
      active: editor?.isActive('bold'),
      action: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      label: 'Italic',
      icon: Italic,
      active: editor?.isActive('italic'),
      action: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      label: 'Underline',
      icon: Underline,
      active: editor?.isActive('underline'),
      action: () => editor?.chain().focus().toggleUnderline().run(),
    },
    {
      label: 'Heading 1',
      icon: Heading1,
      active: editor?.isActive('heading', { level: 1 }),
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: 'Heading 2',
      icon: Heading2,
      active: editor?.isActive('heading', { level: 2 }),
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: 'Bullet list',
      icon: List,
      active: editor?.isActive('bulletList'),
      action: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: 'Numbered list',
      icon: ListOrdered,
      active: editor?.isActive('orderedList'),
      action: () => editor?.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-card p-2">
      {commands.map((command) => (
        <Button
          key={command.label}
          aria-label={command.label}
          className={cn(command.active && 'bg-accent text-accent-foreground')}
          disabled={!editor}
          onClick={command.action}
          size="icon"
          type="button"
          variant="ghost"
        >
          <command.icon className="size-4" />
        </Button>
      ))}
    </div>
  );
}
