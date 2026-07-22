import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Megaphone, Power, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { adsStore, useAds, SLOT_META, type AdItem, type AdSlot, type AdKind } from "@/lib/stores/ads-store";
import { toast } from "sonner";

import SmartImage from "@/components/shared/SmartImage";
const emptyForm = {
  name: "",
  slot: "homepage-top" as AdSlot,
  kind: "manual" as AdKind,
  enabled: true,
  imageUrl: "",
  linkUrl: "",
  htmlSnippet: "",
  adClient: "",
  adSlotId: "",
  format: "auto",
};

const AdminAds = () => {
  const { items, config } = useAds();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [cfg, setCfg] = useState({ adsenseEnabled: config.adsenseEnabled, adsenseClientId: config.adsenseClientId || "" });

  useEffect(() => {
    setCfg({ adsenseEnabled: config.adsenseEnabled, adsenseClientId: config.adsenseClientId || "" });
  }, [config.adsenseClientId, config.adsenseEnabled]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (a: AdItem) => {
    setEditing(a);
    setForm({
      name: a.name, slot: a.slot, kind: a.kind, enabled: a.enabled,
      imageUrl: a.imageUrl || "", linkUrl: a.linkUrl || "", htmlSnippet: a.htmlSnippet || "",
      adClient: a.adClient || "", adSlotId: a.adSlotId || "", format: a.format || "auto",
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return toast.error("নাম আবশ্যক");
    if (form.kind === "manual" && !form.imageUrl && !form.htmlSnippet) {
      return toast.error("ছবি বা HTML স্নিপেট দিন");
    }
    if (form.kind === "adsense" && !form.adSlotId) {
      return toast.error("AdSense Slot ID আবশ্যক");
    }
    if (editing) {
      adsStore.update(editing.id, form);
      toast.success("আপডেট হয়েছে");
    } else {
      adsStore.create(form);
      toast.success("বিজ্ঞাপন যোগ হয়েছে");
    }
    setOpen(false);
  };

  const saveCfg = () => {
    adsStore.saveConfig(cfg);
    toast.success("AdSense সেটিংস সংরক্ষিত");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">বিজ্ঞাপন ব্যবস্থাপনা</h1>
          <p className="text-sm text-muted-foreground mt-1">ম্যানুয়াল ব্যানার ও Google AdSense স্লট</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> নতুন বিজ্ঞাপন</Button>
      </div>

      <Tabs defaultValue="ads">
        <TabsList>
          <TabsTrigger value="ads">বিজ্ঞাপনসমূহ ({items.length})</TabsTrigger>
          <TabsTrigger value="adsense">AdSense সেটিংস</TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="space-y-4 mt-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
              <Megaphone className="h-8 w-8 mx-auto mb-3 opacity-50" />
              এখনো কোনো বিজ্ঞাপন তৈরি হয়নি
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border/50 shadow-card divide-y divide-border/50">
              {items.map((a) => (
                <div key={a.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {a.imageUrl ? (
                      <SmartImage src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                    ) : (
                      <Megaphone className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant={a.kind === "adsense" ? "default" : "secondary"}>{a.kind === "adsense" ? "AdSense" : "ম্যানুয়াল"}</Badge>
                      <Badge variant="outline">{SLOT_META[a.slot].label}</Badge>
                      {!a.enabled && <Badge variant="outline" className="text-muted-foreground">বন্ধ</Badge>}
                    </div>
                    <div className="font-medium truncate">{a.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {a.kind === "adsense" ? `Slot: ${a.adSlotId}` : (a.linkUrl || a.imageUrl || "HTML")}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => adsStore.toggle(a.id)} title={a.enabled ? "বন্ধ করুন" : "চালু করুন"}>
                      <Power className={`h-4 w-4 ${a.enabled ? "text-primary" : ""}`} />
                    </Button>
                    {a.linkUrl && (
                      <a href={a.linkUrl} target="_blank" rel="noopener">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                      </a>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>"{a.name}" মুছবেন?</AlertDialogTitle>
                          <AlertDialogDescription>স্থায়ীভাবে মুছে যাবে।</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { adsStore.remove(a.id); toast.success("মুছে ফেলা হয়েছে"); }}>মুছুন</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="adsense" className="mt-4">
          <div className="rounded-2xl bg-card border border-border/50 shadow-card p-5 sm:p-6 space-y-4 max-w-2xl">
            <div>
              <h2 className="font-semibold">Google AdSense গ্লোবাল সেটিংস</h2>
              <p className="text-sm text-muted-foreground mt-1">আপনার AdSense Publisher ID যোগ করুন। স্ক্রিপ্ট স্বয়ংক্রিয়ভাবে লোড হবে।</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">AdSense চালু</div>
                <div className="text-xs text-muted-foreground">সমস্ত AdSense স্লট রেন্ডার করবে</div>
              </div>
              <Switch checked={cfg.adsenseEnabled} onCheckedChange={(v) => setCfg({ ...cfg, adsenseEnabled: v })} />
            </div>
            <div className="space-y-1.5">
              <Label>Publisher ID (ca-pub-...)</Label>
              <Input value={cfg.adsenseClientId} onChange={(e) => setCfg({ ...cfg, adsenseClientId: e.target.value })} placeholder="ca-pub-1234567890123456" className="font-mono" />
            </div>
            <Button onClick={saveCfg}>সংরক্ষণ করুন</Button>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "বিজ্ঞাপন এডিট" : "নতুন বিজ্ঞাপন"}</DialogTitle>
            <DialogDescription>ম্যানুয়াল ব্যানার বা AdSense স্লট কনফিগার করুন।</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>নাম *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="যেমন: হোমপেজ ব্যানার" />
              </div>
              <div className="space-y-1.5">
                <Label>স্লট</Label>
                <Select value={form.slot} onValueChange={(v) => setForm({ ...form, slot: v as AdSlot })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SLOT_META).map(([k, m]) => (
                      <SelectItem key={k} value={k}>{m.label} — {m.desc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>ধরন</Label>
                <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v as AdKind })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">ম্যানুয়াল (ছবি/HTML)</SelectItem>
                    <SelectItem value="adsense">Google AdSense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.kind === "manual" ? (
              <div className="space-y-4 rounded-xl border border-border/60 p-4 bg-muted/20">
                <div className="space-y-1.5">
                  <Label>ছবি URL</Label>
                  <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label>লিংক URL</Label>
                  <Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label>অথবা HTML স্নিপেট</Label>
                  <Textarea rows={4} value={form.htmlSnippet} onChange={(e) => setForm({ ...form, htmlSnippet: e.target.value })} placeholder='<a href="..."><img src="..."/></a>' className="font-mono text-xs" />
                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-xl border border-border/60 p-4 bg-muted/20">
                <div className="space-y-1.5">
                  <Label>AdSense Slot ID *</Label>
                  <Input value={form.adSlotId} onChange={(e) => setForm({ ...form, adSlotId: e.target.value })} placeholder="1234567890" className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>Publisher ID (ঐচ্ছিক — গ্লোবাল না হলে)</Label>
                  <Input value={form.adClient} onChange={(e) => setForm({ ...form, adClient: e.target.value })} placeholder="ca-pub-..." className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>ফরম্যাট</Label>
                  <Select value={form.format} onValueChange={(v) => setForm({ ...form, format: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="rectangle">Rectangle</SelectItem>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label>সক্রিয়</Label>
              <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">বাতিল</Button></DialogClose>
            <Button onClick={save}>সংরক্ষণ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAds;
