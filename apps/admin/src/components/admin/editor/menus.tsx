import type { Editor } from "@tiptap/react";
import {
  ChevronDown, Pilcrow, Heading1, Heading2, Heading3, Heading4, Quote, Code2,
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { FONT_FAMILIES, FONT_SIZES } from "./constants";
import { TBtn } from "./primitives";

export const BlockTypeMenu = ({ editor }: { editor: Editor }) => {
  const label = editor.isActive("heading", { level: 1 }) ? "H1"
    : editor.isActive("heading", { level: 2 }) ? "H2"
    : editor.isActive("heading", { level: 3 }) ? "H3"
    : editor.isActive("heading", { level: 4 }) ? "H4"
    : editor.isActive("blockquote") ? "উদ্ধৃতি"
    : editor.isActive("codeBlock") ? "কোড"
    : "প্যারাগ্রাফ";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 gap-1 text-xs font-medium min-w-[110px] justify-between">
          {label} <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="text-[10px] uppercase">টেক্সট স্টাইল</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow className="h-4 w-4 mr-2" /> প্যারাগ্রাফ</DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4 mr-2" /> হেডিং ১</DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4 mr-2" /> হেডিং ২</DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4 mr-2" /> হেডিং ৩</DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}><Heading4 className="h-4 w-4 mr-2" /> হেডিং ৪</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4 mr-2" /> উদ্ধৃতি</DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 className="h-4 w-4 mr-2" /> কোড ব্লক</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const FontFamilyMenu = ({ editor }: { editor: Editor }) => {
  const current = editor.getAttributes("textStyle").fontFamily as string | undefined;
  const currentLabel = FONT_FAMILIES.find((f) => f.value === current)?.label.split(" ")[0] || "ফন্ট";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 gap-1 text-xs min-w-[100px] justify-between">
          <span className="truncate max-w-[80px]">{currentLabel}</span> <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase">ফন্ট ফ্যামিলি</DropdownMenuLabel>
        {FONT_FAMILIES.map((f) => (
          <DropdownMenuItem key={f.value} onClick={() => editor.chain().focus().setFontFamily(f.value).run()} style={{ fontFamily: f.value }}>
            {f.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => editor.chain().focus().unsetFontFamily().run()}>রিসেট</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const FontSizeMenu = ({ editor }: { editor: Editor }) => {
  const current = (editor.getAttributes("textStyle").fontSize as string | undefined) || "16px";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 gap-1 text-xs min-w-[70px] justify-between">
          {current} <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-28">
        <DropdownMenuLabel className="text-[10px] uppercase">সাইজ</DropdownMenuLabel>
        {FONT_SIZES.map((s) => (
          <DropdownMenuItem key={s} onClick={() => (editor.chain().focus() as any).setFontSize(s).run()}>{s}</DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => (editor.chain().focus() as any).unsetFontSize().run()}>রিসেট</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const InlineBubble = ({ editor, onOpenLink }: { editor: Editor; onOpenLink: () => void }) => {
  const toggleRTL = () => {
    const isPara = editor.isActive("paragraph");
    const isHead = editor.isActive("heading");
    if (!isPara && !isHead) return;
    const attrs = editor.getAttributes(isPara ? "paragraph" : "heading");
    const next = attrs.dir === "rtl" ? null : "rtl";
    editor.chain().focus().updateAttributes(isPara ? "paragraph" : "heading", { dir: next }).run();
  };
  const rtlActive =
    editor.getAttributes("paragraph").dir === "rtl" || editor.getAttributes("heading").dir === "rtl";
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-popover shadow-lg p-1">
      <TBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-3.5 w-3.5" /></TBtn>
      <TBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-3.5 w-3.5" /></TBtn>
      <TBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-3.5 w-3.5" /></TBtn>
      <TBtn title="Link" active={editor.isActive("link")} onClick={onOpenLink}><LinkIcon className="h-3.5 w-3.5" /></TBtn>
      <TBtn title="RTL" active={rtlActive} onClick={toggleRTL}><Languages className="h-3.5 w-3.5" /></TBtn>
    </div>
  );
};
