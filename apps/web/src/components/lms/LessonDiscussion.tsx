import { useState } from "react";
import { Link } from "@/lib/navigation";
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Trash2,
  Shield,
  Reply as ReplyIcon,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/server/auth/session";
import {
  discussionsStore,
  useLessonDiscussions,
  type DiscussionThread,
} from "@/lib/stores/discussions-store";
import { toast } from "@/hooks/use-toast";

interface Props {
  courseId: string;
  lessonId: string;
}

const formatTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "এইমাত্র";
  if (m < 60) return `${m} মিনিট আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ঘণ্টা আগে`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} দিন আগে`;
  return new Date(iso).toLocaleDateString("bn-BD");
};

const RoleBadge = ({ role }: { role: "student" | "instructor" | "admin" }) => {
  if (role === "instructor")
    return (
      <Badge className="bg-primary/15 text-primary hover:bg-primary/20 border-0 text-[10px] px-1.5 py-0">
        <Shield className="h-2.5 w-2.5 mr-1" /> শিক্ষক
      </Badge>
    );
  if (role === "admin")
    return (
      <Badge className="bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/30 border-0 text-[10px] px-1.5 py-0">
        <Shield className="h-2.5 w-2.5 mr-1" /> অ্যাডমিন
      </Badge>
    );
  return null;
};

const ThreadCard = ({
  thread,
  currentUserId,
  isStaff,
}: {
  thread: DiscussionThread;
  currentUserId: string | null;
  isStaff: boolean;
}) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const session = useSession();

  const canManage = isStaff || thread.userId === currentUserId;
  const hasUpvoted = currentUserId ? thread.upvotes.includes(currentUserId) : false;

  const submitReply = () => {
    if (!session.user) {
      toast({ title: "লগইন প্রয়োজন", variant: "destructive" });
      return;
    }
    const body = replyText.trim();
    if (body.length < 2) return;
    discussionsStore.addReply(thread.id, {
      userId: session.user.id,
      userName: session.user.name,
      userAvatar: session.user.avatar ?? null,
      role: (session.role ?? "student") as "student" | "instructor" | "admin",
      body,
    });
    setReplyText("");
    setReplyOpen(false);
  };

  return (
    <Card className={`p-4 sm:p-5 ${thread.resolved ? "border-primary/40 bg-primary/[0.03]" : ""}`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={thread.userAvatar || undefined} />
          <AvatarFallback className="text-xs">{thread.userName.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{thread.userName}</span>
            <RoleBadge role={thread.role} />
            <span className="text-xs text-muted-foreground">· {formatTime(thread.createdAt)}</span>
            {thread.resolved && (
              <Badge className="bg-primary text-primary-foreground border-0 text-[10px] px-1.5 py-0">
                <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> সমাধান হয়েছে
              </Badge>
            )}
          </div>
          <h3 className="mt-2 font-serif-bn font-bold text-base sm:text-lg">{thread.title}</h3>
          <p className="text-sm text-foreground/80 whitespace-pre-line mt-1 leading-relaxed">
            {thread.body}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 gap-1 ${hasUpvoted ? "text-primary" : "text-muted-foreground"}`}
              onClick={() =>
                currentUserId
                  ? discussionsStore.toggleUpvote(thread.id, currentUserId)
                  : toast({ title: "লগইন প্রয়োজন", variant: "destructive" })
              }
            >
              <ThumbsUp className="h-3.5 w-3.5" fill={hasUpvoted ? "currentColor" : "none"} />
              <span className="text-xs">{thread.upvotes.length}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-muted-foreground"
              onClick={() => setReplyOpen((v) => !v)}
            >
              <ReplyIcon className="h-3.5 w-3.5" />
              <span className="text-xs">উত্তর ({thread.replies.length})</span>
            </Button>
            {isStaff && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-muted-foreground"
                onClick={() => discussionsStore.toggleResolved(thread.id)}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="text-xs">
                  {thread.resolved ? "আনরিজলভ" : "সমাধান চিহ্নিত"}
                </span>
              </Button>
            )}
            {canManage && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-destructive hover:text-destructive"
                onClick={() => discussionsStore.remove(thread.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Replies */}
          {thread.replies.length > 0 && (
            <div className="mt-4 space-y-3 pl-3 border-l-2 border-foreground/10">
              {thread.replies.map((r) => {
                const replyUpvoted = currentUserId ? r.upvotes.includes(currentUserId) : false;
                const canDeleteReply = isStaff || r.userId === currentUserId;
                return (
                  <div key={r.id} className="flex items-start gap-2.5">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={r.userAvatar || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {r.userName.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold">{r.userName}</span>
                        <RoleBadge role={r.role} />
                        <span className="text-[10px] text-muted-foreground">
                          · {formatTime(r.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 whitespace-pre-line mt-0.5 leading-relaxed">
                        {r.body}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 gap-1 px-2 ${
                            replyUpvoted ? "text-primary" : "text-muted-foreground"
                          }`}
                          onClick={() =>
                            currentUserId
                              ? discussionsStore.toggleReplyUpvote(thread.id, r.id, currentUserId)
                              : toast({ title: "লগইন প্রয়োজন", variant: "destructive" })
                          }
                        >
                          <ThumbsUp
                            className="h-3 w-3"
                            fill={replyUpvoted ? "currentColor" : "none"}
                          />
                          <span className="text-[10px]">{r.upvotes.length}</span>
                        </Button>
                        {canDeleteReply && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive hover:text-destructive"
                            onClick={() => discussionsStore.removeReply(thread.id, r.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reply composer */}
          {replyOpen && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="আপনার উত্তর লিখুন..."
                rows={2}
                className="text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyOpen(false);
                    setReplyText("");
                  }}
                >
                  বাতিল
                </Button>
                <Button size="sm" onClick={submitReply} disabled={replyText.trim().length < 2}>
                  <Send className="h-3.5 w-3.5 mr-1" /> পোস্ট
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const LessonDiscussion = ({ courseId, lessonId }: Props) => {
  const { user, isAuthenticated, role } = useSession();
  const threads = useLessonDiscussions(courseId, lessonId);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sort, setSort] = useState<"recent" | "top" | "unresolved">("recent");

  const isStaff = role === "instructor" || role === "admin";

  const sorted = [...threads].sort((a, b) => {
    if (sort === "top") return b.upvotes.length - a.upvotes.length;
    if (sort === "unresolved") return Number(a.resolved) - Number(b.resolved);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const submit = async () => {
    if (!user) return;
    if (title.trim().length < 3 || body.trim().length < 5) {
      toast({
        title: "অসম্পূর্ণ",
        description: "প্রশ্নের শিরোনাম ও বিস্তারিত লিখুন।",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    discussionsStore.create({
      courseId,
      lessonId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar ?? null,
      role: (role ?? "student") as "student" | "instructor" | "admin",
      title: title.trim(),
      body: body.trim(),
    });
    setTitle("");
    setBody("");
    setSubmitting(false);
    toast({ title: "প্রশ্ন পোস্ট হয়েছে" });
  };

  return (
    <section className="mt-2 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-bold">
            আলোচনা ও প্রশ্ন{" "}
            <span className="text-muted-foreground font-normal text-sm">({threads.length})</span>
          </h2>
        </div>
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {[
            { id: "recent", label: "সাম্প্রতিক" },
            { id: "top", label: "জনপ্রিয়" },
            { id: "unresolved", label: "অমীমাংসিত" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSort(t.id as typeof sort)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                sort === t.id
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      {isAuthenticated ? (
        <Card className="p-4 sm:p-5 space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="আপনার প্রশ্নের শিরোনাম..."
            className="font-semibold"
          />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="বিস্তারিত লিখুন — যত স্পষ্ট প্রশ্ন, তত ভাল উত্তর পাবেন।"
            rows={3}
          />
          <div className="flex justify-end">
            <Button onClick={submit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              প্রশ্ন পোস্ট করুন
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-5 text-center bg-muted/30">
          <p className="text-sm text-muted-foreground mb-3">
            প্রশ্ন করতে বা আলোচনায় অংশ নিতে লগইন করুন।
          </p>
          <Link to="/login">
            <Button size="sm">লগইন করুন</Button>
          </Link>
        </Card>
      )}

      {/* Threads */}
      {sorted.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm border border-dashed rounded-xl">
          এখনো কোনো প্রশ্ন নেই। প্রথম প্রশ্নটি আপনিই করুন!
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((t) => (
            <ThreadCard
              key={t.id}
              thread={t}
              currentUserId={user?.id ?? null}
              isStaff={isStaff}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default LessonDiscussion;
