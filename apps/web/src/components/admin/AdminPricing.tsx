import { useState, useEffect } from "react";
import { Plus, Trash2, RotateCcw, Save, ChevronUp, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  PRICING_DEFAULTS,
  type PricingContent,
  type PricingPlan,
  type PricingFaq,
} from "@/server/queries/pricing.queries";
import { updatePricingContent } from "@/server/actions/pricing.actions";
import { getPricingContent } from "@/server/queries/pricing.queries";

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const AdminPricing = () => {
  const [draft, setDraft] = useState<PricingContent>(PRICING_DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPricingContent().then((res) => {
      setDraft(res);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    const res = await updatePricingContent(draft);
    if (res.ok) {
      toast({ title: "সংরক্ষিত হয়েছে", description: "প্রাইসিং পেজ আপডেট হয়েছে।" });
    } else {
      toast({ title: "ত্রুটি হয়েছে", variant: "destructive" });
    }
  };

  const reset = async () => {
    setDraft(PRICING_DEFAULTS);
    await updatePricingContent(PRICING_DEFAULTS);
    toast({ title: "ডিফল্ট রিস্টোর হয়েছে" });
  };

  const updatePlan = (id: string, patch: Partial<PricingPlan>) =>
    setDraft({
      ...draft,
      plans: draft.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });

  const removePlan = (id: string) =>
    setDraft({ ...draft, plans: draft.plans.filter((p) => p.id !== id) });

  const addPlan = () =>
    setDraft({
      ...draft,
      plans: [
        ...draft.plans,
        {
          id: uid(),
          name: "নতুন প্ল্যান",
          tagline: "",
          priceMonthly: 0,
          priceYearly: 0,
          features: ["ফিচার ১"],
          ctaLabel: "শুরু করুন",
          ctaHref: "/register",
          active: true,
        },
      ],
    });

  const updateFaq = (id: string, patch: Partial<PricingFaq>) =>
    setDraft({
      ...draft,
      faqs: draft.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">প্রাইসিং / মেম্বারশিপ</h1>
          <p className="text-sm text-muted-foreground">
            প্ল্যান, ফিচার ও FAQ সম্পাদনা করুন। পরিবর্তন তৎক্ষণাৎ /pricing পেজে দেখা যাবে।
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" /> ডিফল্ট
          </Button>
          <Button onClick={save}>
            <Save className="h-4 w-4 mr-2" /> সেভ করুন
          </Button>
        </div>
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">পেজ সক্রিয়</Label>
          <Switch
            checked={draft.enabled}
            onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>হেডিং</Label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div>
            <Label>বার্ষিক ডিসকাউন্ট নোট</Label>
            <Input
              value={draft.yearlyDiscountNote || ""}
              onChange={(e) => setDraft({ ...draft, yearlyDiscountNote: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>সাবটাইটেল</Label>
          <Textarea
            value={draft.subtitle}
            onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
            rows={2}
          />
        </div>
        <div>
          <Label>গ্যারান্টি নোট</Label>
          <Input
            value={draft.guaranteeNote || ""}
            onChange={(e) => setDraft({ ...draft, guaranteeNote: e.target.value })}
          />
        </div>
      </Card>

      <Tabs defaultValue="plans">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plans">প্ল্যান ({draft.plans.length})</TabsTrigger>
          <TabsTrigger value="faqs">FAQ ({draft.faqs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {draft.plans.map((p) => (
            <Card key={p.id} className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={p.active}
                    onCheckedChange={(v) => updatePlan(p.id, { active: v })}
                  />
                  <span className="font-semibold">{p.name}</span>
                  {p.highlighted && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      হাইলাইটেড
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => removePlan(p.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>নাম</Label>
                  <Input value={p.name} onChange={(e) => updatePlan(p.id, { name: e.target.value })} />
                </div>
                <div>
                  <Label>ট্যাগলাইন</Label>
                  <Input
                    value={p.tagline || ""}
                    onChange={(e) => updatePlan(p.id, { tagline: e.target.value })}
                  />
                </div>
                <div>
                  <Label>মাসিক মূল্য (৳)</Label>
                  <Input
                    type="number"
                    value={p.priceMonthly}
                    onChange={(e) => updatePlan(p.id, { priceMonthly: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>বার্ষিক মূল্য (৳)</Label>
                  <Input
                    type="number"
                    value={p.priceYearly}
                    onChange={(e) => updatePlan(p.id, { priceYearly: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>ব্যাজ (ঐচ্ছিক)</Label>
                  <Input
                    value={p.badge || ""}
                    onChange={(e) => updatePlan(p.id, { badge: e.target.value })}
                  />
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!p.highlighted}
                      onCheckedChange={(v) => updatePlan(p.id, { highlighted: v })}
                    />
                    <Label>হাইলাইট</Label>
                  </div>
                </div>
                <div>
                  <Label>CTA টেক্সট</Label>
                  <Input
                    value={p.ctaLabel || ""}
                    onChange={(e) => updatePlan(p.id, { ctaLabel: e.target.value })}
                  />
                </div>
                <div>
                  <Label>CTA লিঙ্ক</Label>
                  <Input
                    value={p.ctaHref || ""}
                    onChange={(e) => updatePlan(p.id, { ctaHref: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>ফিচার সমূহ (প্রতি লাইনে একটি)</Label>
                <Textarea
                  rows={6}
                  value={p.features.join("\n")}
                  onChange={(e) =>
                    updatePlan(p.id, {
                      features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            </Card>
          ))}

          <Button variant="outline" onClick={addPlan} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> নতুন প্ল্যান যোগ করুন
          </Button>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-3">
          {draft.faqs.map((f) => (
            <Card key={f.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <Input
                  value={f.q}
                  onChange={(e) => updateFaq(f.id, { q: e.target.value })}
                  placeholder="প্রশ্ন"
                  className="font-semibold"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDraft({ ...draft, faqs: draft.faqs.filter((x) => x.id !== f.id) })
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <Textarea
                rows={3}
                value={f.a}
                onChange={(e) => updateFaq(f.id, { a: e.target.value })}
                placeholder="উত্তর"
              />
            </Card>
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              setDraft({
                ...draft,
                faqs: [...draft.faqs, { id: uid(), q: "নতুন প্রশ্ন", a: "" }],
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" /> নতুন FAQ যোগ করুন
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPricing;
