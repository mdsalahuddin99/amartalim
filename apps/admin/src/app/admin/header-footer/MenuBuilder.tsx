"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

import { getBlogCategories } from "@/server/actions/blog-category.actions";
import { getBookCategories } from "@/server/actions/book-category.actions";

interface MenuLink {
  id: string;
  label: string;
  url: string;
  type?: "custom" | "category" | "page";
  isSubmenu?: boolean;
}

interface SortableItemProps {
  link: MenuLink;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: string, value: string) => void;
}

function SortableItem({ link, onRemove, onUpdate }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: link.id });
  const [isExpanded, setIsExpanded] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-background border rounded-xl overflow-hidden mb-3 shadow-sm ${link.isSubmenu ? 'ml-8 border-l-4 border-l-primary' : ''}`}>
      <div className="flex items-center gap-2 p-3 bg-secondary/20 hover:bg-secondary/40 transition-colors">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:text-primary">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div 
          className="flex-1 font-medium text-sm flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="truncate pr-2">{link.label || "(নামহীন)"}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{link.url}</span>
        </div>
        <div className="flex items-center gap-2">
          {link.type && (
            <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full hidden sm:inline-block">
              {link.type === 'custom' ? 'কাস্টম' : link.type === 'category' ? 'ক্যাটাগরি' : 'পেজ'}
            </span>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t space-y-3 bg-background">
          <div>
            <Label className="text-xs mb-1.5 block">নেভিগেশন লেবেল</Label>
            <Input
              value={link.label}
              onChange={(e) => onUpdate(link.id, "label", e.target.value)}
              className="h-9 rounded-lg"
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">ইউআরএল</Label>
            <Input
              value={link.url}
              onChange={(e) => onUpdate(link.id, "url", e.target.value)}
              className="h-9 rounded-lg"
            />
          </div>
          <div className="pt-2 flex justify-between items-center">
             <span className="text-xs text-muted-foreground">
               মেইন মেনুর আইটেম
             </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(link.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              মুছে ফেলুন (Remove)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface MenuBuilderProps {
  links: MenuLink[];
  setLinks: (links: MenuLink[]) => void;
  title?: string;
  description?: string;
}

export function MenuBuilder({ links, setLinks, title = "হেডার মেনু (Navigation)", description = "ওয়েবসাইটের মেনু আইটেমগুলো নির্ধারণ করুন।" }: MenuBuilderProps) {
  const [blogCats, setBlogCats] = useState<any[]>([]);
  const [bookCats, setBookCats] = useState<any[]>([]);
  
  // Custom link states
  const [customLabel, setCustomLabel] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  // Category selections
  const [selectedBlogCats, setSelectedBlogCats] = useState<string[]>([]);
  const [selectedBookCats, setSelectedBookCats] = useState<string[]>([]);

  useEffect(() => {
    getBlogCategories().then(res => {
      if (res.ok && res.data) setBlogCats(res.data);
    });
    getBookCategories().then(res => {
      if (res.ok && res.data) setBookCats(res.data);
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over, delta } = event;

    let newLinks = [...links];

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((l) => l.id === active.id);
      const newIndex = links.findIndex((l) => l.id === over.id);
      newLinks = arrayMove(newLinks, oldIndex, newIndex);
    }

    const activeItemIndex = newLinks.findIndex(l => l.id === active.id);
    if (activeItemIndex !== -1) {
      const activeItem = newLinks[activeItemIndex];
      // Check horizontal drag for submenu nesting
      if (delta.x > 30 && activeItemIndex > 0) {
        // Dragged right -> make submenu
        activeItem.isSubmenu = true;
      } else if (delta.x < -30) {
        // Dragged left -> make main menu
        activeItem.isSubmenu = false;
      }
    }

    // Enforce rule: first item cannot be a submenu
    if (newLinks.length > 0) {
      newLinks[0].isSubmenu = false;
    }

    setLinks(newLinks);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const updateLink = (id: string, field: string, value: string) => {
    setLinks(
      links.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const addCustomLink = () => {
    if (!customLabel || !customUrl) return;
    setLinks([
      ...links,
      { id: Date.now().toString(), label: customLabel, url: customUrl, type: "custom" },
    ]);
    setCustomLabel("");
    setCustomUrl("");
  };

  const addBlogCategoriesToMenu = () => {
    const newLinks = selectedBlogCats.map(id => {
      const cat = blogCats.find(c => c.id === id);
      return {
        id: `blog-${id}-${Date.now()}`,
        label: cat?.name || "",
        url: `/blogs?cat=${cat?.id}`,
        type: "category" as const
      };
    });
    setLinks([...links, ...newLinks]);
    setSelectedBlogCats([]);
  };

  const addBookCategoriesToMenu = () => {
    const newLinks = selectedBookCats.map(id => {
      const cat = bookCats.find(c => c.id === id);
      return {
        id: `book-${id}-${Date.now()}`,
        label: cat?.name || "",
        url: `/library?cat=${cat?.slug || id}`,
        type: "category" as const
      };
    });
    setLinks([...links, ...newLinks]);
    setSelectedBookCats([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Sidebar - Add Items */}
      <div className="lg:col-span-4 space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">
          মেনু আইটেম যুক্ত করুন
        </h3>
        
        <Accordion type="single" collapsible className="w-full bg-card rounded-2xl border shadow-sm">
          {/* Custom Links */}
          <AccordionItem value="custom-links" className="border-b-0 border-b border-border/50">
            <AccordionTrigger className="px-4 py-3 hover:bg-secondary/20 hover:no-underline">
              <span className="font-medium text-sm">কাস্টম লিংক</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs mb-1 block">ইউআরএল</Label>
                  <Input 
                    placeholder="https://" 
                    value={customUrl} 
                    onChange={e => setCustomUrl(e.target.value)}
                    className="h-9 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">লিংক টেক্সট</Label>
                  <Input 
                    placeholder="মেনু নাম" 
                    value={customLabel}
                    onChange={e => setCustomLabel(e.target.value)}
                    className="h-9 rounded-lg"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button size="sm" onClick={addCustomLink} disabled={!customLabel || !customUrl} className="rounded-lg">
                    মেনুতে যুক্ত করুন
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Blog Categories */}
          <AccordionItem value="blog-categories" className="border-b-0 border-b border-border/50">
            <AccordionTrigger className="px-4 py-3 hover:bg-secondary/20 hover:no-underline">
              <span className="font-medium text-sm">ব্লগ ক্যাটাগরি</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
               <div className="space-y-2 max-h-48 overflow-y-auto pr-2 mb-3">
                  {blogCats.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">কোনো ক্যাটাগরি নেই।</p>
                  ) : (
                    blogCats.map(cat => (
                      <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary/20 p-1.5 rounded-md">
                        <Checkbox 
                          checked={selectedBlogCats.includes(cat.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedBlogCats([...selectedBlogCats, cat.id]);
                            else setSelectedBlogCats(selectedBlogCats.filter(id => id !== cat.id));
                          }}
                        />
                        <span className="flex-1 truncate">{cat.name}</span>
                      </label>
                    ))
                  )}
               </div>
               <div className="flex justify-end pt-2 border-t border-border/50">
                  <Button size="sm" onClick={addBlogCategoriesToMenu} disabled={selectedBlogCats.length === 0} className="rounded-lg">
                    মেনুতে যুক্ত করুন
                  </Button>
               </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Book Categories */}
          <AccordionItem value="book-categories" className="border-b-0">
            <AccordionTrigger className="px-4 py-3 hover:bg-secondary/20 hover:no-underline">
              <span className="font-medium text-sm">বইয়ের ক্যাটাগরি</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
               <div className="space-y-2 max-h-48 overflow-y-auto pr-2 mb-3">
                  {bookCats.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">কোনো ক্যাটাগরি নেই।</p>
                  ) : (
                    bookCats.map(cat => (
                      <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary/20 p-1.5 rounded-md">
                        <Checkbox 
                          checked={selectedBookCats.includes(cat.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedBookCats([...selectedBookCats, cat.id]);
                            else setSelectedBookCats(selectedBookCats.filter(id => id !== cat.id));
                          }}
                        />
                        <span className="flex-1 truncate">{cat.name}</span>
                      </label>
                    ))
                  )}
               </div>
               <div className="flex justify-end pt-2 border-t border-border/50">
                  <Button size="sm" onClick={addBookCategoriesToMenu} disabled={selectedBookCats.length === 0} className="rounded-lg">
                    মেনুতে যুক্ত করুন
                  </Button>
               </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Right Area - Menu Structure */}
      <div className="lg:col-span-8">
         <div className="bg-card border rounded-2xl p-5 shadow-sm min-h-[400px]">
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {description}
            </p>
            
            {links.length === 0 ? (
              <div className="border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground bg-secondary/10 flex flex-col items-center justify-center">
                 <Plus className="h-8 w-8 mb-2 opacity-50" />
                 বাম পাশ থেকে মেনু আইটেম যুক্ত করুন।
              </div>
            ) : (
              <DndContext
                id={`dnd-${title.replace(/\s+/g, '-').toLowerCase()}`}
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={links.map(l => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-0 pb-10">
                    {links.map((link) => (
                      <SortableItem
                        key={link.id}
                        link={link}
                        onRemove={removeLink}
                        onUpdate={updateLink}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
         </div>
      </div>
    </div>
  );
}
