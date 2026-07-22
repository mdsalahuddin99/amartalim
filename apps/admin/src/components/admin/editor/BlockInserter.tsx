import { useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Pilcrow, Heading2, Heading3, List, ListOrdered, CheckSquare, Quote,
  AlertTriangle, Code2, Minus, Image as ImageIcon,
  Table as TableIcon, Search,
} from "lucide-react";
import { Youtube as YoutubeIcon } from "@/components/shared/BrandIcons";
import { Input } from "@/components/ui/input";

export type BlockDef = {
  id: string;
  label: string;
  group: "টেক্সট" | "মিডিয়া" | "ডিজাইন" | "এম্বেড";
  icon: React.ReactNode;
  keywords?: string[];
  run: (ctx: {
    editor: Editor;
    openLink: () => void;
    openYoutube: () => void;
    insertImage: () => void;
  }) => void;
};

export const BLOCKS: BlockDef[] = [
  { id: "paragraph", label: "প্যারাগ্রাফ", group: "টেক্সট", icon: <Pilcrow className="h-4 w-4" />, keywords: ["text", "p"], run: ({ editor }) => editor.chain().focus().setParagraph().run() },
  { id: "h2", label: "হেডিং ২", group: "টেক্সট", icon: <Heading2 className="h-4 w-4" />, run: ({ editor }) => editor.chain().focus().setHeading({ level: 2 }).run() },
  { id: "h3", label: "হেডিং ৩", group: "টেক্সট", icon: <Heading3 className="h-4 w-4" />, run: ({ editor }) => editor.chain().focus().setHeading({ level: 3 }).run() },
  { id: "ul", label: "বুলেট লিস্ট", group: "টেক্সট", icon: <List className="h-4 w-4" />, run: ({ editor }) => editor.chain().focus().toggleBulletList().run() },
  { id: "ol", label: "নাম্বার লিস্ট", group: "টেক্সট", icon: <ListOrdered className="h-4 w-4" />, run: ({ editor }) => editor.chain().focus().toggleOrderedList().run() },
  { id: "task", label: "টাস্ক লিস্ট", group: "টেক্সট", icon: <CheckSquare className="h-4 w-4" />, run: ({ editor }) => editor.chain().focus().toggleTaskList().run() },
  { id: "quote", label: "উদ্ধৃতি", group: "টেক্সট", icon: <Quote className="h-4 w-4" />, run: ({ editor }) => editor.chain().focus().toggleBlockquote().run() },
  {
    id: "callout", label: "Callout বক্স", group: "ডিজাইন", icon: <AlertTriangle className="h-4 w-4" />,
    run: ({ editor }) =>
      editor.chain().focus().insertContent(
        `<blockquote class="callout"><p><strong>📌 নোট:</strong> এখানে গুরুত্বপূর্ণ তথ্য লিখুন।</p></blockquote><p></p>`,
      ).run(),
  },
  { id: "code", label: "কোড ব্লক", group: "টেক্সট", icon: <Code2 className="h-4 w-4" />, run: ({ editor }) => editor.chain().focus().toggleCodeBlock().run() },
  { id: "hr", label: "সেপারেটর", group: "ডিজাইন", icon: <Minus className="h-4 w-4" />, run: ({ editor }) => editor.chain().focus().setHorizontalRule().run() },
  { id: "image", label: "ইমেজ", group: "মিডিয়া", icon: <ImageIcon className="h-4 w-4" />, run: ({ insertImage }) => insertImage() },
  { id: "youtube", label: "YouTube", group: "এম্বেড", icon: <YoutubeIcon className="h-4 w-4" />, run: ({ openYoutube }) => openYoutube() },
  { id: "table", label: "টেবিল", group: "ডিজাইন", icon: <TableIcon className="h-4 w-4" />, run: ({ editor }) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
];

export const BlockInserter = ({
  onPickAction,
  autoFocus = true,
}: {
  editor: Editor;
  onPickAction: (block: BlockDef) => void;
  autoFocus?: boolean;
}) => {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return BLOCKS;
    return BLOCKS.filter((b) => b.label.toLowerCase().includes(s) || b.keywords?.some((k) => k.includes(s)));
  }, [q]);
  const groups = useMemo(() => {
    const map = new Map<string, BlockDef[]>();
    filtered.forEach((b) => {
      const list = map.get(b.group) ?? [];
      list.push(b);
      map.set(b.group, list);
    });
    return Array.from(map.entries());
  }, [filtered]);
  return (
    <div className="w-72">
      <div className="relative border-b border-border/60">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ব্লক খুঁজুন..."
          className="h-9 pl-7 border-0 rounded-none focus-visible:ring-0"
        />
      </div>
      <div className="max-h-72 overflow-y-auto p-2 space-y-3">
        {groups.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">কোনো ব্লক পাওয়া যায়নি</p>
        )}
        {groups.map(([group, items]) => (
          <div key={group}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1.5 mb-1">{group}</p>
            <div className="grid grid-cols-3 gap-1">
              {items.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onPickAction(b)}
                  className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-muted text-[11px] text-center transition-colors"
                  title={b.label}
                >
                  <span className="text-muted-foreground">{b.icon}</span>
                  <span className="leading-tight">{b.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
