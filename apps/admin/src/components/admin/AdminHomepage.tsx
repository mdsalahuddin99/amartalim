import { useState, useEffect } from "react";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  homepageStore,
  useHomepageContent,
  HOMEPAGE_DEFAULTS,
  type HomepageContent,
  type CounterItem,
  type CategoryItem,
  type TestimonialItem,
  type PartnerItem,
} from "@/lib/stores/homepage-store";

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const AdminHomepage = () => {
  const { content } = useHomepageContent();
  const [draft, setDraft] = useState<HomepageContent>(content);
  
  useEffect(() => {
    if (content) {
      setDraft(content);
    }
  }, [content]);

  const save = async () => {
    await homepageStore.save(draft);
    toast({ title: "সংরক্ষিত হয়েছে", description: "হোমপেজ আপডেট হয়েছে।" });
  };

  const reset = async () => {
    await homepageStore.reset();
    setDraft(HOMEPAGE_DEFAULTS);
    toast({ title: "ডিফল্ট রিস্টোর হয়েছে" });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">হোমপেজ কনটেন্ট</h1>
          <p className="text-sm text-muted-foreground">
            কাউন্টার, ক্যাটাগরি গ্রিড, টেস্টিমোনিয়াল ও পার্টনার লোগো — সব কিছু এখান থেকে নিয়ন্ত্রণ করুন।
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" /> ডিফল্ট রিস্টোর
          </Button>
          <Button onClick={save}>
            <Save className="h-4 w-4 mr-2" /> সেভ করুন
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hero">
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="hero">হিরো</TabsTrigger>
          <TabsTrigger value="sections">সেকশনসমূহ</TabsTrigger>
          <TabsTrigger value="counters">কাউন্টার</TabsTrigger>
          <TabsTrigger value="categories">ক্যাটাগরি</TabsTrigger>
          <TabsTrigger value="testimonials">টেস্টিমোনিয়াল</TabsTrigger>
          <TabsTrigger value="partners">পার্টনার</TabsTrigger>
        </TabsList>
        
        {/* Hero Section */}
        <TabsContent value="hero">
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-4">হিরো সেকশন সেটিংস</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="ব্যাজ (Badge)">
                  <Input 
                    value={draft.hero?.badge || ""} 
                    onChange={e => setDraft({ ...draft, hero: { ...draft.hero!, badge: e.target.value }})} 
                  />
                </Field>
                <Field label="টাইটেল লাইন ১">
                  <Input 
                    value={draft.hero?.titleLine1 || ""} 
                    onChange={e => setDraft({ ...draft, hero: { ...draft.hero!, titleLine1: e.target.value }})} 
                  />
                </Field>
                <Field label="টাইটেল লাইন ২ (হাইলাইটেড)">
                  <Input 
                    value={draft.hero?.titleLine2 || ""} 
                    onChange={e => setDraft({ ...draft, hero: { ...draft.hero!, titleLine2: e.target.value }})} 
                  />
                </Field>
                <Field label="টাইটেল সাফিক্স">
                  <Input 
                    value={draft.hero?.titleSuffix || ""} 
                    onChange={e => setDraft({ ...draft, hero: { ...draft.hero!, titleSuffix: e.target.value }})} 
                  />
                </Field>
                <Field className="md:col-span-2" label="ডেসক্রিপশন">
                  <Textarea 
                    value={draft.hero?.description || ""} 
                    onChange={e => setDraft({ ...draft, hero: { ...draft.hero!, description: e.target.value }})} 
                    rows={3}
                  />
                </Field>
                <Field label="স্ট্যাটস টেক্সট (Trust Indicators)">
                  <Input 
                    value={draft.hero?.statsText || ""} 
                    onChange={e => setDraft({ ...draft, hero: { ...draft.hero!, statsText: e.target.value }})} 
                  />
                </Field>
                <Field className="md:col-span-2" label="হিরো ইমেজ URL (Hero Image)">
                  <Input 
                    placeholder="https://..."
                    value={draft.hero?.image || ""} 
                    onChange={e => setDraft({ ...draft, hero: { ...draft.hero!, image: e.target.value }})} 
                  />
                </Field>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Sections */}
        <TabsContent value="sections">
          <Card className="p-6 space-y-6">
            <h2 className="text-lg font-bold mb-4">সেকশন টাইটেল ও সাবটাইটেল</h2>
            <div className="grid gap-8">
              
              <div className="space-y-4">
                <h3 className="font-semibold text-primary">আমাদের সেবাসমূহ (Features)</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="টাইটেল">
                    <Input value={draft.features?.title || ""} onChange={e => setDraft({ ...draft, features: { ...draft.features!, title: e.target.value }})} />
                  </Field>
                  <Field label="সাবটাইটেল">
                    <Input value={draft.features?.subtitle || ""} onChange={e => setDraft({ ...draft, features: { ...draft.features!, subtitle: e.target.value }})} />
                  </Field>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-primary">কোর্স ক্যাটাগরি</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="টাইটেল">
                    <Input value={draft.courseCategoriesSection?.title || ""} onChange={e => setDraft({ ...draft, courseCategoriesSection: { ...draft.courseCategoriesSection!, title: e.target.value }})} />
                  </Field>
                  <Field label="সাবটাইটেল">
                    <Input value={draft.courseCategoriesSection?.subtitle || ""} onChange={e => setDraft({ ...draft, courseCategoriesSection: { ...draft.courseCategoriesSection!, subtitle: e.target.value }})} />
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-primary">শিগগিরই আসছে (Coming Soon)</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="টাইটেল">
                    <Input value={draft.comingSoon?.title || ""} onChange={e => setDraft({ ...draft, comingSoon: { ...draft.comingSoon!, title: e.target.value }})} />
                  </Field>
                  <Field label="সাবটাইটেল">
                    <Textarea value={draft.comingSoon?.subtitle || ""} onChange={e => setDraft({ ...draft, comingSoon: { ...draft.comingSoon!, subtitle: e.target.value }})} />
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-primary">প্রশ্নোত্তর (QA)</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="টাইটেল">
                    <Input value={draft.qa?.title || ""} onChange={e => setDraft({ ...draft, qa: { ...draft.qa!, title: e.target.value }})} />
                  </Field>
                  <Field label="সাবটাইটেল">
                    <Input value={draft.qa?.subtitle || ""} onChange={e => setDraft({ ...draft, qa: { ...draft.qa!, subtitle: e.target.value }})} />
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-primary">লাইব্রেরি</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="টাইটেল">
                    <Input value={draft.library?.title || ""} onChange={e => setDraft({ ...draft, library: { ...draft.library!, title: e.target.value }})} />
                  </Field>
                  <Field label="সাবটাইটেল">
                    <Textarea value={draft.library?.subtitle || ""} onChange={e => setDraft({ ...draft, library: { ...draft.library!, subtitle: e.target.value }})} />
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-primary">ব্লগ</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="টাইটেল">
                    <Input value={draft.blogs?.title || ""} onChange={e => setDraft({ ...draft, blogs: { ...draft.blogs!, title: e.target.value }})} />
                  </Field>
                  <Field label="সাবটাইটেল">
                    <Input value={draft.blogs?.subtitle || ""} onChange={e => setDraft({ ...draft, blogs: { ...draft.blogs!, subtitle: e.target.value }})} />
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-primary">CTA Section</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="টাইটেল">
                    <Input value={draft.cta?.title || ""} onChange={e => setDraft({ ...draft, cta: { ...draft.cta!, title: e.target.value }})} />
                  </Field>
                  <Field label="সাবটাইটেল">
                    <Textarea value={draft.cta?.subtitle || ""} onChange={e => setDraft({ ...draft, cta: { ...draft.cta!, subtitle: e.target.value }})} />
                  </Field>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Counters */}
        <TabsContent value="counters">
          <SectionShell
            title="কাউন্টার (পরিসংখ্যান)"
            enabled={draft.counters.enabled}
            onEnabledChange={(v) =>
              setDraft({ ...draft, counters: { ...draft.counters, enabled: v } })
            }
            sectionTitle={draft.counters.title || ""}
            onSectionTitleChange={(v) =>
              setDraft({ ...draft, counters: { ...draft.counters, title: v } })
            }
            sectionSubtitle={draft.counters.subtitle || ""}
            onSectionSubtitleChange={(v) =>
              setDraft({ ...draft, counters: { ...draft.counters, subtitle: v } })
            }
            onAdd={() =>
              setDraft({
                ...draft,
                counters: {
                  ...draft.counters,
                  items: [
                    ...draft.counters.items,
                    { id: uid(), label: "নতুন আইটেম", value: 100, suffix: "+", icon: "✨" },
                  ],
                },
              })
            }
          >
            {draft.counters.items.map((c, i) => (
              <Card key={c.id} className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <Field className="sm:col-span-2" label="আইকন (emoji)">
                  <Input
                    value={c.icon || ""}
                    onChange={(e) =>
                      updateItem(draft, setDraft, "counters", i, { icon: e.target.value })
                    }
                  />
                </Field>
                <Field className="sm:col-span-4" label="লেবেল">
                  <Input
                    value={c.label}
                    onChange={(e) =>
                      updateItem(draft, setDraft, "counters", i, { label: e.target.value })
                    }
                  />
                </Field>
                <Field className="sm:col-span-3" label="সংখ্যা">
                  <Input
                    type="number"
                    value={c.value}
                    onChange={(e) =>
                      updateItem(draft, setDraft, "counters", i, {
                        value: Number(e.target.value) || 0,
                      })
                    }
                  />
                </Field>
                <Field className="sm:col-span-2" label="সাফিক্স">
                  <Input
                    value={c.suffix || ""}
                    onChange={(e) =>
                      updateItem(draft, setDraft, "counters", i, { suffix: e.target.value })
                    }
                  />
                </Field>
                <div className="sm:col-span-1 flex justify-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem(draft, setDraft, "counters", i)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </SectionShell>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories">
          <SectionShell
            title="জনপ্রিয় ক্যাটাগরি"
            enabled={draft.categories.enabled}
            onEnabledChange={(v) =>
              setDraft({ ...draft, categories: { ...draft.categories, enabled: v } })
            }
            sectionTitle={draft.categories.title || ""}
            onSectionTitleChange={(v) =>
              setDraft({ ...draft, categories: { ...draft.categories, title: v } })
            }
            sectionSubtitle={draft.categories.subtitle || ""}
            onSectionSubtitleChange={(v) =>
              setDraft({ ...draft, categories: { ...draft.categories, subtitle: v } })
            }
            onAdd={() =>
              setDraft({
                ...draft,
                categories: {
                  ...draft.categories,
                  items: [
                    ...draft.categories.items,
                    { id: uid(), name: "নতুন বিভাগ", icon: "📘", href: "/courses", count: 0 },
                  ],
                },
              })
            }
          >
            {draft.categories.items.map((c, i) => (
              <Card key={c.id} className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <Field className="sm:col-span-2" label="আইকন">
                  <Input
                    value={c.icon}
                    onChange={(e) =>
                      updateItem(draft, setDraft, "categories", i, { icon: e.target.value })
                    }
                  />
                </Field>
                <Field className="sm:col-span-4" label="নাম">
                  <Input
                    value={c.name}
                    onChange={(e) =>
                      updateItem(draft, setDraft, "categories", i, { name: e.target.value })
                    }
                  />
                </Field>
                <Field className="sm:col-span-3" label="লিংক">
                  <Input
                    value={c.href}
                    onChange={(e) =>
                      updateItem(draft, setDraft, "categories", i, { href: e.target.value })
                    }
                  />
                </Field>
                <Field className="sm:col-span-2" label="কাউন্ট">
                  <Input
                    type="number"
                    value={c.count ?? 0}
                    onChange={(e) =>
                      updateItem(draft, setDraft, "categories", i, {
                        count: Number(e.target.value) || 0,
                      })
                    }
                  />
                </Field>
                <div className="sm:col-span-1 flex justify-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem(draft, setDraft, "categories", i)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </SectionShell>
        </TabsContent>

        {/* Testimonials */}
        <TabsContent value="testimonials">
          <SectionShell
            title="শিক্ষার্থীদের মতামত"
            enabled={draft.testimonials.enabled}
            onEnabledChange={(v) =>
              setDraft({ ...draft, testimonials: { ...draft.testimonials, enabled: v } })
            }
            sectionTitle={draft.testimonials.title || ""}
            onSectionTitleChange={(v) =>
              setDraft({ ...draft, testimonials: { ...draft.testimonials, title: v } })
            }
            sectionSubtitle={draft.testimonials.subtitle || ""}
            onSectionSubtitleChange={(v) =>
              setDraft({ ...draft, testimonials: { ...draft.testimonials, subtitle: v } })
            }
            onAdd={() =>
              setDraft({
                ...draft,
                testimonials: {
                  ...draft.testimonials,
                  items: [
                    ...draft.testimonials.items,
                    { id: uid(), name: "নতুন শিক্ষার্থী", role: "", quote: "...", rating: 5 },
                  ],
                },
              })
            }
          >
            {draft.testimonials.items.map((t, i) => (
              <Card key={t.id} className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <Field className="sm:col-span-4" label="নাম">
                    <Input
                      value={t.name}
                      onChange={(e) =>
                        updateItem(draft, setDraft, "testimonials", i, { name: e.target.value })
                      }
                    />
                  </Field>
                  <Field className="sm:col-span-4" label="পদবি / শহর">
                    <Input
                      value={t.role || ""}
                      onChange={(e) =>
                        updateItem(draft, setDraft, "testimonials", i, { role: e.target.value })
                      }
                    />
                  </Field>
                  <Field className="sm:col-span-2" label="রেটিং (১-৫)">
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={t.rating ?? 5}
                      onChange={(e) =>
                        updateItem(draft, setDraft, "testimonials", i, {
                          rating: Math.max(1, Math.min(5, Number(e.target.value) || 5)),
                        })
                      }
                    />
                  </Field>
                  <div className="sm:col-span-2 flex justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(draft, setDraft, "testimonials", i)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <Field label="অ্যাভাটার URL (ঐচ্ছিক)">
                  <Input
                    placeholder="https://..."
                    value={t.avatar || ""}
                    onChange={(e) =>
                      updateItem(draft, setDraft, "testimonials", i, { avatar: e.target.value })
                    }
                  />
                </Field>
                <Field label="মন্তব্য">
                  <Textarea
                    rows={3}
                    value={t.quote}
                    onChange={(e) =>
                      updateItem(draft, setDraft, "testimonials", i, { quote: e.target.value })
                    }
                  />
                </Field>
              </Card>
            ))}
          </SectionShell>
        </TabsContent>

        {/* Partners */}
        <TabsContent value="partners">
          <SectionShell
            title="পার্টনার লোগো"
            enabled={draft.partners.enabled}
            onEnabledChange={(v) =>
              setDraft({ ...draft, partners: { ...draft.partners, enabled: v } })
            }
            sectionTitle={draft.partners.title || ""}
            onSectionTitleChange={(v) =>
              setDraft({ ...draft, partners: { ...draft.partners, title: v } })
            }
            sectionSubtitle={draft.partners.subtitle || ""}
            onSectionSubtitleChange={(v) =>
              setDraft({ ...draft, partners: { ...draft.partners, subtitle: v } })
            }
            onAdd={() =>
              setDraft({
                ...draft,
                partners: {
                  ...draft.partners,
                  items: [...draft.partners.items, { id: uid(), name: "নতুন পার্টনার" }],
                },
              })
            }
          >
            {draft.partners.items.map((p, i) => (
              <Card key={p.id} className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <Field className="sm:col-span-4" label="নাম">
                  <Input
                    value={p.name}
                    onChange={(e) =>
                      updateItem(draft, setDraft, "partners", i, { name: e.target.value })
                    }
                  />
                </Field>
                <Field className="sm:col-span-4" label="লোগো URL (ঐচ্ছিক)">
                  <Input
                    placeholder="https://..."
                    value={p.logoUrl || ""}
                    onChange={(e) =>
                      updateItem(draft, setDraft, "partners", i, { logoUrl: e.target.value })
                    }
                  />
                </Field>
                <Field className="sm:col-span-3" label="ওয়েবসাইট (ঐচ্ছিক)">
                  <Input
                    placeholder="https://..."
                    value={p.href || ""}
                    onChange={(e) =>
                      updateItem(draft, setDraft, "partners", i, { href: e.target.value })
                    }
                  />
                </Field>
                <div className="sm:col-span-1 flex justify-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem(draft, setDraft, "partners", i)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </SectionShell>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-2" /> রিস্টোর
        </Button>
        <Button onClick={save}>
          <Save className="h-4 w-4 mr-2" /> সব পরিবর্তন সেভ করুন
        </Button>
      </div>
    </div>
  );
};

const Field = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
    {children}
  </div>
);

const SectionShell = ({
  title,
  enabled,
  onEnabledChange,
  sectionTitle,
  onSectionTitleChange,
  sectionSubtitle,
  onSectionSubtitleChange,
  onAdd,
  children,
}: {
  title: string;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  sectionTitle: string;
  onSectionTitleChange: (v: string) => void;
  sectionSubtitle?: string;
  onSectionSubtitleChange?: (v: string) => void;
  onAdd: () => void;
  children: React.ReactNode;
}) => (
  <Card className="p-5 space-y-4 mt-4">
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h2 className="font-bold text-lg">{title}</h2>
        <p className="text-xs text-muted-foreground">হোমপেজে এই সেকশনটি দেখানো হবে কিনা।</p>
      </div>
      <div className="flex items-center gap-3">
        <Label htmlFor={`en-${title}`} className="text-sm">
          সক্রিয়
        </Label>
        <Switch id={`en-${title}`} checked={enabled} onCheckedChange={onEnabledChange} />
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="সেকশনের শিরোনাম">
        <Input value={sectionTitle} onChange={(e) => onSectionTitleChange(e.target.value)} />
      </Field>
      {onSectionSubtitleChange && (
        <Field label="সেকশনের সাবটাইটেল">
          <Input value={sectionSubtitle || ""} onChange={(e) => onSectionSubtitleChange(e.target.value)} />
        </Field>
      )}
    </div>
    <div className="space-y-3">{children}</div>
    <Button variant="outline" onClick={onAdd} className="w-full">
      <Plus className="h-4 w-4 mr-2" /> নতুন আইটেম যোগ করুন
    </Button>
  </Card>
);

type SectionKey = "counters" | "categories" | "testimonials" | "partners";
type ItemMap = {
  counters: CounterItem;
  categories: CategoryItem;
  testimonials: TestimonialItem;
  partners: PartnerItem;
};

function updateItem<K extends SectionKey>(
  draft: HomepageContent,
  setDraft: (c: HomepageContent) => void,
  key: K,
  index: number,
  patch: Partial<ItemMap[K]>,
) {
  const section = draft[key];
  const items = [...(section.items as ItemMap[K][])];
  items[index] = { ...items[index], ...patch };
  setDraft({ ...draft, [key]: { ...section, items } } as HomepageContent);
}

function removeItem<K extends SectionKey>(
  draft: HomepageContent,
  setDraft: (c: HomepageContent) => void,
  key: K,
  index: number,
) {
  const section = draft[key];
  const items = (section.items as ItemMap[K][]).filter((_, i) => i !== index);
  setDraft({ ...draft, [key]: { ...section, items } } as HomepageContent);
}

export default AdminHomepage;
