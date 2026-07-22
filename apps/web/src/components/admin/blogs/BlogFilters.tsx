import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BlogTab } from "./BlogStatCards";

interface Props {
  query: string;
  onQuery: (v: string) => void;
  tab: BlogTab;
  onTab: (t: BlogTab) => void;
}

export const BlogFilters = ({ query, onQuery, tab, onTab }: Props) => (
  <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="শিরোনাম বা ট্যাগ দিয়ে খুঁজুন..."
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        className="pl-9"
      />
    </div>
    <Tabs value={tab} onValueChange={(v) => onTab(v as BlogTab)}>
      <TabsList>
        <TabsTrigger value="all">সব</TabsTrigger>
        <TabsTrigger value="draft">ড্রাফট</TabsTrigger>
        <TabsTrigger value="pending">রিভিউ</TabsTrigger>
        <TabsTrigger value="scheduled">নির্ধারিত</TabsTrigger>
        <TabsTrigger value="published">প্রকাশিত</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
);
