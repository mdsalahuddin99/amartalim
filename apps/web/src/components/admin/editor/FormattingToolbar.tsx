import type { Editor } from "@tiptap/react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Palette, Highlighter,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, CheckSquare,
  Indent, Outdent, Quote, Link as LinkIcon, Image as ImageIcon,
  Table as TableIcon, Minus, Subscript as SubIcon, Superscript as SupIcon, RemoveFormatting,
} from "lucide-react";
import { Youtube as YoutubeIcon } from "@/components/shared/BrandIcons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { COLORS, HIGHLIGHTS } from "./constants";
import { TBtn, Sep } from "./primitives";
import { BlockTypeMenu, FontFamilyMenu, FontSizeMenu } from "./menus";

type Props = {
  editor: Editor;
  onOpenLink: () => void;
  onOpenYoutube: () => void;
  onInsertImage: () => void;
};

export const FormattingToolbar = ({ editor, onOpenLink, onOpenYoutube, onInsertImage }: Props) => (
  <div className="flex items-center gap-0.5 px-2 py-1 flex-wrap">
    <BlockTypeMenu editor={editor} />
    <Sep />
    <FontFamilyMenu editor={editor} />
    <FontSizeMenu editor={editor} />
    <Sep />
    <TBtn title="Bold (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></TBtn>
    <TBtn title="Italic (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></TBtn>
    <TBtn title="Underline (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-4 w-4" /></TBtn>
    <TBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></TBtn>
    <TBtn title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Code className="h-4 w-4" /></TBtn>
    <Sep />

    <Popover>
      <PopoverTrigger asChild>
        <button type="button" title="টেক্সট কালার" className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted">
          <Palette className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-6 gap-1">
          {COLORS.map((c) => (
            <button key={c} type="button" onClick={() => editor.chain().focus().setColor(c).run()} className="w-7 h-7 rounded border border-border" style={{ background: c }} />
          ))}
          <button type="button" onClick={() => editor.chain().focus().unsetColor().run()} className="w-7 h-7 rounded border border-border bg-background text-[10px]">✕</button>
        </div>
      </PopoverContent>
    </Popover>

    <Popover>
      <PopoverTrigger asChild>
        <button type="button" title="হাইলাইট" className={cn("h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted", editor.isActive("highlight") && "bg-primary/10")}>
          <Highlighter className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-4 gap-1">
          {HIGHLIGHTS.map((c) => (
            <button key={c} type="button" onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()} className="w-7 h-7 rounded border border-border" style={{ background: c }} />
          ))}
          <button type="button" onClick={() => editor.chain().focus().unsetHighlight().run()} className="w-7 h-7 rounded border border-border bg-background text-[10px]">✕</button>
        </div>
      </PopoverContent>
    </Popover>

    <Sep />
    <TBtn title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft className="h-4 w-4" /></TBtn>
    <TBtn title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter className="h-4 w-4" /></TBtn>
    <TBtn title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight className="h-4 w-4" /></TBtn>
    <TBtn title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}><AlignJustify className="h-4 w-4" /></TBtn>

    <Sep />
    <TBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></TBtn>
    <TBtn title="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></TBtn>
    <TBtn title="Task list" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}><CheckSquare className="h-4 w-4" /></TBtn>
    <TBtn title="Indent" onClick={() => { if (editor.can().sinkListItem("listItem")) editor.chain().focus().sinkListItem("listItem").run(); }}><Indent className="h-4 w-4" /></TBtn>
    <TBtn title="Outdent" onClick={() => { if (editor.can().liftListItem("listItem")) editor.chain().focus().liftListItem("listItem").run(); }}><Outdent className="h-4 w-4" /></TBtn>

    <Sep />
    <TBtn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></TBtn>
    <TBtn title="Link (Ctrl+K)" active={editor.isActive("link")} onClick={onOpenLink}><LinkIcon className="h-4 w-4" /></TBtn>
    <TBtn title="ইমেজ" onClick={onInsertImage}><ImageIcon className="h-4 w-4" /></TBtn>
    <TBtn title="YouTube" onClick={onOpenYoutube}><YoutubeIcon className="h-4 w-4" /></TBtn>
    <TBtn title="টেবিল" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon className="h-4 w-4" /></TBtn>
    <TBtn title="সেপারেটর" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-4 w-4" /></TBtn>

    <Sep />
    <TBtn title="Subscript" active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()}><SubIcon className="h-4 w-4" /></TBtn>
    <TBtn title="Superscript" active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()}><SupIcon className="h-4 w-4" /></TBtn>
    <TBtn title="ফরম্যাট মুছুন" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><RemoveFormatting className="h-4 w-4" /></TBtn>
  </div>
);
