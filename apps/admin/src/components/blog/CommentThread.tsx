import { useState } from "react";
import { MessageSquare, Reply, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlogComments } from "@/lib/stores/comments-store";
import { useSession } from "@/server/auth/session";
import { deleteComment } from "@/server/actions/comment.actions";
import { toast } from "@/hooks/use-toast";
import CommentForm from "./CommentForm";
import type { CommentNode } from "@/types/comment";

const MAX_DEPTH = 4;

const timeAgo = (iso: string) => {
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

interface NodeProps {
  node: CommentNode;
  blogId: string;
  depth: number;
}

const CommentItem = ({ node, blogId, depth }: NodeProps) => {
  const { user } = useSession();
  const [replying, setReplying] = useState(false);
  const isOwner = user?.id === node.authorId;
  const isDeleted = !!node.deletedAt;

  const handleDelete = async () => {
    if (!confirm("এই মন্তব্য মুছে ফেলবেন?")) return;
    const res = await deleteComment(node.id);
    if ("error" in res) {
      toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
    }
  };

  return (
    <article className="flex gap-3">
      <div className="w-9 h-9 rounded-full bg-foreground/10 text-foreground flex items-center justify-center font-serif-bn font-bold shrink-0">
        {(node.authorName?.charAt(0) || "?").toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-semibold text-sm">{node.authorName}</span>
          <time className="text-xs text-muted-foreground" dateTime={node.createdAt}>
            {timeAgo(node.createdAt)}
          </time>
        </header>

        {isDeleted ? (
          <p className="mt-1 text-sm italic text-muted-foreground">[মন্তব্যটি মুছে ফেলা হয়েছে]</p>
        ) : (
          <p className="mt-1 text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
            {node.body}
          </p>
        )}

        {!isDeleted && (
          <div className="mt-2 flex items-center gap-1 -ml-2">
            {depth < MAX_DEPTH && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => setReplying((s) => !s)}
              >
                <Reply className="w-3.5 h-3.5" /> উত্তর দিন
              </Button>
            )}
            {isOwner && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5" /> মুছুন
              </Button>
            )}
          </div>
        )}

        {replying && (
          <div className="mt-3">
            <CommentForm
              blogId={blogId}
              parentId={node.id}
              autoFocus
              placeholder={`${node.authorName}-কে উত্তর দিন…`}
              submitLabel="উত্তর পাঠান"
              onCancel={() => setReplying(false)}
              onSubmitted={() => setReplying(false)}
            />
          </div>
        )}

        {node.children.length > 0 && (
          <div className="mt-4 space-y-5 border-l border-foreground/10 pl-4 sm:pl-5">
            {node.children.map((child) => (
              <CommentItem key={child.id} node={child} blogId={blogId} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

interface ThreadProps {
  blogId: string;
}

const CommentThread = ({ blogId }: ThreadProps) => {
  const thread = useBlogComments(blogId);
  const total = thread.reduce(function count(acc, n): number {
    return acc + 1 + n.children.reduce(count, 0);
  }, 0);

  return (
    <section className="mt-14" id="comments" aria-labelledby="comments-title">
      <header className="flex items-end justify-between mb-6 pb-3 border-b-2 border-foreground">
        <h2
          id="comments-title"
          className="font-serif-bn font-black text-2xl sm:text-3xl flex items-center gap-2"
        >
          <MessageSquare className="w-6 h-6" />
          মন্তব্য <span className="text-muted-foreground tabular-nums">({total})</span>
        </h2>
      </header>

      <div className="mb-8">
        <CommentForm blogId={blogId} />
      </div>

      {thread.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্য করুন!
        </p>
      ) : (
        <div className="space-y-6">
          {thread.map((node) => (
            <CommentItem key={node.id} node={node} blogId={blogId} depth={0} />
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentThread;
