import { useMemo, useState } from "react";
import { MessageSquare, Trash2, RotateCcw, Search, ExternalLink, Check, X } from "lucide-react";
import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { approveComment, rejectComment, deleteComment } from "@/server/actions/comment.actions";
import { toast } from "@/hooks/use-toast";
import { formatBlogDate } from "@/lib/seed/blog-data";
import { useRouter } from "next/navigation";

type FilterKey = "pending" | "approved" | "rejected" | "deleted" | "all";

const AdminComments = ({ initialComments }: { initialComments: any[] }) => {
  const comments = initialComments;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<FilterKey>("pending");
  const [confirm, setConfirm] = useState<{ id: string; body: string } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return comments
      .filter((c) => {
        if (tab === "all") return true;
        if (tab === "deleted") return !!c.deletedAt;
        if (c.deletedAt) return false;
        return c.status?.toLowerCase() === tab;
      })
      .filter((c) => {
        if (!q) return true;
        return (
          c.body.toLowerCase().includes(q) ||
          c.authorName.toLowerCase().includes(q) ||
          (c.blogTitle || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [comments, tab, query]);

  const counts = useMemo(() => ({
    pending: comments.filter((c) => !c.deletedAt && c.status === "PENDING").length,
    approved: comments.filter((c) => !c.deletedAt && c.status === "APPROVED").length,
    rejected: comments.filter((c) => !c.deletedAt && c.status === "REJECTED").length,
    deleted: comments.filter((c) => !!c.deletedAt).length,
    all: comments.length,
  }), [comments]);

  const handleDelete = async (id: string) => {
    await deleteComment(id);
    toast({ title: "মন্তব্য মুছে ফেলা হয়েছে" });
    setConfirm(null);
    router.refresh();
  };

  const handleApprove = async (id: string) => {
    await approveComment(id);
    toast({ title: "মন্তব্য অনুমোদিত হয়েছে" });
    router.refresh();
  };

  const handleReject = async (id: string) => {
    await rejectComment(id);
    toast({ title: "মন্তব্য বাতিল করা হয়েছে" });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" /> মন্তব্য মডারেশন
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          ব্লগ পোস্টে আসা মন্তব্যগুলো পর্যালোচনা ও মুছে ফেলুন
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["pending", "approved", "rejected", "deleted"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`p-4 rounded-2xl border text-left transition-colors ${
              tab === k ? "border-primary bg-primary/5" : "border-border/50 bg-card hover:bg-secondary"
            }`}
          >
            <div className="text-2xl font-bold">{counts[k]}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {k === "pending" ? "অপেক্ষমান" : k === "approved" ? "অনুমোদিত" : k === "rejected" ? "বাতিল" : "মুছে ফেলা"}
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="মন্তব্য, লেখক বা পোস্ট খুঁজুন..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as FilterKey)}>
          <TabsList>
            <TabsTrigger value="pending">অপেক্ষমান</TabsTrigger>
            <TabsTrigger value="approved">অনুমোদিত</TabsTrigger>
            <TabsTrigger value="rejected">বাতিল</TabsTrigger>
            <TabsTrigger value="deleted">মুছে ফেলা</TabsTrigger>
            <TabsTrigger value="all">সব</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
            কোন মন্তব্য পাওয়া যায়নি
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {filtered.map((c) => {
              return (
                <li key={c.id} className="p-4 flex gap-3 hover:bg-muted/30 transition-colors">
                  <Avatar className="h-9 w-9 shrink-0">
                    {c.authorAvatar && <AvatarImage src={c.authorAvatar} alt={c.authorName} />}
                    <AvatarFallback>{c.authorName.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold">{c.authorName}</span>
                      {c.deletedAt && (
                        <Badge variant="secondary" className="bg-destructive/15 text-destructive">
                          মুছে ফেলা
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {formatBlogDate(c.createdAt)}
                      </span>
                    </div>
                    {c.deletedAt ? (
                      <p className="text-sm text-muted-foreground italic">[মুছে ফেলা মন্তব্য]</p>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {c.body}
                      </p>
                    )}
                    {c.blogSlug && (
                      <Link
                        to={`/blogs/${c.blogSlug}#comments`}
                        target="_blank"
                        className="text-[11px] text-primary hover:underline mt-2 inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {c.blogTitle}
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 shrink-0">
                    {!c.deletedAt && c.status === "PENDING" && (
                      <>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900"
                          title="অনুমোদন করুন"
                          onClick={() => handleApprove(c.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                          title="বাতিল করুন"
                          onClick={() => handleReject(c.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {!c.deletedAt && (
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                        title="মুছুন"
                        onClick={() => setConfirm({ id: c.id, body: c.body })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(v) => !v && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>মন্তব্য মুছবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirm?.body.slice(0, 80)}{confirm && confirm.body.length > 80 ? "…" : ""}" স্থায়ীভাবে মুছে যাবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirm && handleDelete(confirm.id)}
            >মুছুন</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminComments;
