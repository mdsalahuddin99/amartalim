import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Code, Link as LinkIcon, Image as ImageIcon, Eye, Edit3, SplitSquareHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Mode = "edit" | "split" | "preview";

interface Props {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}

export const MarkdownEditor = ({ value, onChange, rows = 16 }: Props) => {
  const [mode, setMode] = useState<Mode>("split");
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after = before, placeholder = "") => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
    });
  };

  const prefixLine = (prefix: string) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + prefix.length;
    });
  };

  const tools = [
    { icon: Heading2, label: "H2", onClick: () => prefixLine("## ") },
    { icon: Heading3, label: "H3", onClick: () => prefixLine("### ") },
    { icon: Bold, label: "Bold", onClick: () => wrap("**", "**", "bold") },
    { icon: Italic, label: "Italic", onClick: () => wrap("*", "*", "italic") },
    { icon: List, label: "List", onClick: () => prefixLine("- ") },
    { icon: ListOrdered, label: "Ordered", onClick: () => prefixLine("1. ") },
    { icon: Quote, label: "Quote", onClick: () => prefixLine("> ") },
    { icon: Code, label: "Code", onClick: () => wrap("`", "`", "code") },
    { icon: LinkIcon, label: "Link", onClick: () => wrap("[", "](https://)", "text") },
    { icon: ImageIcon, label: "Image", onClick: () => wrap("![alt](", ")", "https://") },
  ];

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-2 py-1.5 bg-muted/30 flex-wrap gap-2">
        <div className="flex items-center gap-0.5 flex-wrap">
          {tools.map((t) => (
            <Button
              key={t.label}
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title={t.label}
              onClick={t.onClick}
            >
              <t.icon className="h-3.5 w-3.5" />
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-0.5">
          <Button type="button" variant={mode === "edit" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setMode("edit")} title="Edit">
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant={mode === "split" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setMode("split")} title="Split">
            <SplitSquareHorizontal className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant={mode === "preview" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setMode("preview")} title="Preview">
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className={cn("grid", mode === "split" ? "md:grid-cols-2" : "grid-cols-1")}>
        {(mode === "edit" || mode === "split") && (
          <Textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className="font-mono text-sm rounded-none border-0 border-r border-border/60 focus-visible:ring-0 resize-none"
            placeholder="## হেডিং&#10;&#10;আপনার লেখা মার্কডাউনে লিখুন..."
          />
        )}
        {(mode === "preview" || mode === "split") && (
          <div className="p-4 prose prose-sm max-w-none dark:prose-invert overflow-auto" style={{ minHeight: `${rows * 1.5}rem` }}>
            {value.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground text-sm italic">প্রিভিউ এখানে দেখা যাবে...</p>
            )}
          </div>
        )}
      </div>
      <div className="border-t border-border/60 px-3 py-1.5 text-[11px] text-muted-foreground flex items-center justify-between bg-muted/20">
        <span>মার্কডাউন সমর্থিত · **bold** *italic* [link](url) ## heading</span>
        <span>{value.length} অক্ষর · ~{Math.max(1, Math.ceil(value.length / 1200))} মিনিট</span>
      </div>
    </div>
  );
};

export default MarkdownEditor;
