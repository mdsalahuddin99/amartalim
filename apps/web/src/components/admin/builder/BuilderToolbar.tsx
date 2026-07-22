import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Undo2, Redo2, History, Save, CheckCircle2, Loader2, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { useCourseBuilderHistory } from "./useCourseBuilderHistory";

type HistoryApi = ReturnType<typeof useCourseBuilderHistory>;

const timeAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return "এইমাত্র";
  if (s < 60) return `${s} সে আগে`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} মি আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ঘ আগে`;
  return new Date(ts).toLocaleString("bn-BD");
};

export const BuilderToolbar = ({ history }: { history: HistoryApi }) => {
  const { status, savedAt, canUndo, canRedo, undo, redo, drafts, saveDraft, restoreDraft, deleteDraft } = history;
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");

  return (
    <div className="flex items-center gap-1.5">
      {/* Autosave status */}
      <div className="hidden md:flex items-center gap-1.5 text-[10px] text-muted-foreground px-2 py-1 rounded-lg bg-secondary/40">
        {status === "saving" ? (
          <><Loader2 className="h-3 w-3 animate-spin" /> সংরক্ষণ হচ্ছে…</>
        ) : status === "saved" && savedAt ? (
          <><CheckCircle2 className="h-3 w-3 text-primary" /> অটোসেভ · {timeAgo(savedAt)}</>
        ) : (
          <>অপেক্ষমাণ</>
        )}
      </div>

      <Button
        variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
        onClick={undo} disabled={!canUndo} title="আনডু (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
        onClick={redo} disabled={!canRedo} title="রিডু (Ctrl+Shift+Z)"
      >
        <Redo2 className="h-4 w-4" />
      </Button>

      {/* Draft versions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs">
            <History className="mr-1 h-3.5 w-3.5" /> ড্রাফট
            {drafts.length > 0 && (
              <span className="ml-1 text-[10px] text-muted-foreground">({drafts.length})</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>ড্রাফট সংস্করণ</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpen(true); }}>
                <Save className="mr-2 h-3.5 w-3.5" /> বর্তমান অবস্থা সংরক্ষণ
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>নতুন ড্রাফট সংস্করণ</DialogTitle></DialogHeader>
              <Input
                value={label} onChange={(e) => setLabel(e.target.value)}
                placeholder="যেমন: কুইজ যোগ করার আগে"
                className="rounded-xl"
              />
              <DialogFooter>
                <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>বাতিল</Button>
                <Button
                  className="rounded-xl bg-gradient-hero hover:opacity-90"
                  onClick={() => {
                    const v = saveDraft(label);
                    if (v) toast.success("ড্রাফট সংরক্ষিত হয়েছে");
                    setLabel(""); setOpen(false);
                  }}
                >সংরক্ষণ</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DropdownMenuSeparator />
          {drafts.length === 0 ? (
            <div className="px-2 py-4 text-center text-[11px] text-muted-foreground">এখনো কোনো ড্রাফট নেই</div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {drafts.map((d) => (
                <div key={d.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-secondary/50 rounded-md">
                  <button
                    type="button"
                    className="flex-1 min-w-0 text-left"
                    onClick={() => { restoreDraft(d.id); toast.success("ড্রাফট পুনরুদ্ধার হয়েছে"); }}
                  >
                    <div className="text-xs font-medium truncate">{d.label}</div>
                    <div className="text-[10px] text-muted-foreground">{timeAgo(d.ts)}</div>
                  </button>
                  <Button
                    variant="ghost" size="icon" className="h-6 w-6 text-destructive"
                    onClick={() => { deleteDraft(d.id); toast.success("মুছে ফেলা হয়েছে"); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
