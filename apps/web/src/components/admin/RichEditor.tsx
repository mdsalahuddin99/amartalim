import { useEffect, useState } from "react";
import { EditorContent } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import {
  Plus, Undo2, Redo2, Sparkles, Code2, Eye, Edit3, Loader2, Clipboard,
  Maximize2, Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { uploadToCloudinary } from "./CloudinaryUploader";
import { toast } from "@/hooks/use-toast";
import {
  BlockInserter, FormattingToolbar, InlineBubble, LinkDialog, YoutubeDialog,
  TBtn, useRichEditor, type BlockDef,
} from "./editor";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const RichEditor = ({ value, onChange, placeholder }: Props) => {
  const [tab, setTab] = useState<"editor" | "html" | "preview">("editor");
  const [aiBusy, setAiBusy] = useState(false);
  const [htmlSrc, setHtmlSrc] = useState(value || "");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [ytOpen, setYtOpen] = useState(false);
  const [ytUrl, setYtUrl] = useState("");
  const [floatInsertOpen, setFloatInsertOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const editor = useRichEditor({ value, onChange, onHtmlSync: setHtmlSrc, placeholder });

  // Block escape from fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const insertImageFromFile = async () => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = async () => {
      const f = input.files?.[0]; if (!f) return;
      try {
        toast({ title: "ইমেজ আপলোড হচ্ছে..." });
        const url = await uploadToCloudinary(f);
        editor.chain().focus().setImage({ src: url }).run();
        toast({ title: "ইমেজ যোগ হয়েছে" });
      } catch (e: any) {
        toast({ title: "ব্যর্থ", description: e?.message, variant: "destructive" });
      }
    };
    input.click();
  };

  const openLink = () => {
    if (!editor) return;
    setLinkUrl(editor.getAttributes("link").href || "");
    setLinkOpen(true);
  };
  const applyLink = () => {
    if (!editor) return;
    if (!linkUrl) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl, target: "_blank" }).run();
    setLinkOpen(false); setLinkUrl("");
  };
  const openYoutube = () => setYtOpen(true);
  const applyYoutube = () => {
    if (ytUrl && editor) editor.chain().focus().setYoutubeVideo({ src: ytUrl, width: 640, height: 360 }).run();
    setYtOpen(false); setYtUrl("");
  };
  const handlePick = (block: BlockDef) => {
    if (!editor) return;
    setFloatInsertOpen(false);
    block.run({ editor, openLink, openYoutube, insertImage: insertImageFromFile });
  };

  const onAI = async () => {
    if (!editor) return;
    const { from, to, empty } = editor.state.selection;
    const slice = empty ? editor.getText() : editor.state.doc.textBetween(from, to, "\n");
    if (!slice.trim()) {
      toast({ title: "লেখা নেই", description: "প্রথমে কিছু লিখুন বা সিলেক্ট করুন।", variant: "destructive" });
      return;
    }
    setAiBusy(true);
    try {
      const res = await fetch("/api/ai/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: slice, lang: "bn" }),
      });
      if (!res.ok) throw new Error(`AI সংযোগ নেই (${res.status})`);
      const data = await res.json();
      const polished: string = data.text || "";
      if (!polished) throw new Error("খালি উত্তর");
      if (empty) editor.commands.setContent(polished.split("\n").map((p) => `<p>${p}</p>`).join(""));
      else editor.chain().focus().deleteRange({ from, to }).insertContent(polished).run();
      toast({ title: "AI পরিশীলন সম্পন্ন" });
    } catch {
      toast({ title: "AI চালু নেই", description: "Lovable Cloud সক্রিয় করলে এটি কাজ করবে।", variant: "destructive" });
    } finally {
      setAiBusy(false);
    }
  };

  const applyHtml = () => {
    onChange(htmlSrc);
    editor?.commands.setContent(htmlSrc || "");
    toast({ title: "HTML প্রয়োগ হয়েছে" });
    setTab("editor");
  };
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setHtmlSrc(text);
      toast({ title: "ক্লিপবোর্ড থেকে পেস্ট হয়েছে" });
    } catch {
      toast({ title: "ক্লিপবোর্ডে access নেই", variant: "destructive" });
    }
  };

  // ─── Stats ───
  const plainText = (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const charCount = plainText.length;
  const readMin = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 overflow-hidden bg-card flex flex-col",
        fullscreen && "fixed inset-0 z-50 rounded-none border-0 h-screen",
      )}
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="flex flex-col flex-1 min-h-0">
        <div className="border-b border-border/60 bg-muted/30 sticky top-0 z-10">
          {/* Row 1: tabs + AI + fullscreen */}
          <div className="flex items-center justify-between px-2 py-1 gap-2 border-b border-border/40">
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" size="sm" variant="ghost" className="h-8 gap-1 px-2" title="ব্লক যোগ করুন">
                    <Plus className="h-4 w-4" /> <span className="text-xs hidden sm:inline">ব্লক</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0 w-auto">
                  {editor && <BlockInserter editor={editor} onPickAction={handlePick} />}
                </PopoverContent>
              </Popover>
              <TBtn title="Undo (Ctrl+Z)" onClick={() => editor?.chain().focus().undo().run()}><Undo2 className="h-4 w-4" /></TBtn>
              <TBtn title="Redo (Ctrl+Y)" onClick={() => editor?.chain().focus().redo().run()}><Redo2 className="h-4 w-4" /></TBtn>
            </div>
            <TabsList className="bg-transparent h-8">
              <TabsTrigger value="editor" className="text-xs gap-1.5 h-7"><Edit3 className="h-3 w-3" /> এডিটর</TabsTrigger>
              <TabsTrigger value="html" className="text-xs gap-1.5 h-7"><Code2 className="h-3 w-3" /> HTML</TabsTrigger>
              <TabsTrigger value="preview" className="text-xs gap-1.5 h-7"><Eye className="h-3 w-3" /> প্রিভিউ</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-1">
              <Button type="button" size="sm" variant="outline" className="gap-1.5 h-8" onClick={onAI} disabled={aiBusy} title="AI পরিশীলন">
                {aiBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline text-xs">AI</span>
              </Button>
              <TBtn title={fullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"} onClick={() => setFullscreen((v) => !v)}>
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </TBtn>
            </div>
          </div>

          {editor && tab === "editor" && (
            <FormattingToolbar
              editor={editor}
              onOpenLink={openLink}
              onOpenYoutube={openYoutube}
              onInsertImage={insertImageFromFile}
            />
          )}
        </div>

        <TabsContent value="editor" className="m-0 relative flex-1 overflow-auto">
          {editor && (
            <BubbleMenu editor={editor} options={{ placement: "top" }}>
              <InlineBubble editor={editor} onOpenLink={openLink} />
            </BubbleMenu>
          )}
          {editor && (
            <FloatingMenu editor={editor} options={{ placement: "left" }}>
              <Popover open={floatInsertOpen} onOpenChange={setFloatInsertOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors -translate-x-2"
                    title="ব্লক যোগ করুন"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" side="right" className="p-0 w-auto">
                  <BlockInserter editor={editor} onPickAction={handlePick} />
                </PopoverContent>
              </Popover>
            </FloatingMenu>
          )}
          <EditorContent editor={editor} />
        </TabsContent>

        <TabsContent value="html" className="m-0 p-3 space-y-2 flex-1 overflow-auto">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">সরাসরি HTML বসান (image, style সহ সম্পূর্ণ markup)।</p>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={pasteFromClipboard} className="gap-1.5">
                <Clipboard className="h-3.5 w-3.5" /> পেস্ট
              </Button>
              <Button type="button" size="sm" onClick={applyHtml}>প্রয়োগ</Button>
            </div>
          </div>
          <Textarea
            value={htmlSrc}
            onChange={(e) => setHtmlSrc(e.target.value)}
            rows={20}
            className="font-mono text-xs"
            placeholder="<h2>শিরোনাম</h2>&#10;<p>আপনার HTML এখানে...</p>"
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0 flex-1 overflow-auto">
          <div
            className={cn("prose prose-sm sm:prose-base max-w-none dark:prose-invert p-5 min-h-[480px]")}
            dangerouslySetInnerHTML={{
              __html: value ? sanitizeHtml(value) : "<p class='text-muted-foreground italic'>প্রিভিউ এখানে দেখা যাবে...</p>",
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Footer stats */}
      <div className="border-t border-border/60 px-3 py-1.5 text-[11px] text-muted-foreground flex items-center justify-between bg-muted/20 gap-3">
        <span className="truncate">WP-style · ফন্ট + সাইজ · বুদবুদ · ব্লক ইনসার্টার · RTL · AI · Fullscreen</span>
        <span className="shrink-0 flex items-center gap-3">
          <span>{wordCount} শব্দ</span>
          <span>{charCount} অক্ষর</span>
          <span>~{readMin} মিনিট</span>
        </span>
      </div>

      <LinkDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        value={linkUrl}
        onValueChange={setLinkUrl}
        onApply={applyLink}
      />
      <YoutubeDialog
        open={ytOpen}
        onOpenChange={setYtOpen}
        value={ytUrl}
        onValueChange={setYtUrl}
        onApply={applyYoutube}
      />
    </div>
  );
};

export default RichEditor;
