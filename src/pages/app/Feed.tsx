import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Post = {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: { full_name: string; headline: string | null; college_name: string | null; avatar_url: string | null };
  like_count: number;
  liked_by_me: boolean;
  comment_count: number;
};

const Feed = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const { data: rawPosts } = await supabase
      .from("posts").select("*").order("created_at", { ascending: false }).limit(50);
    if (!rawPosts) return;

    const ids = rawPosts.map((p) => p.id);
    const authorIds = [...new Set(rawPosts.map((p) => p.author_id))];

    const [{ data: authors }, { data: likes }, { data: comments }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, headline, college_name, avatar_url").in("id", authorIds),
      ids.length ? supabase.from("post_likes").select("post_id, user_id").in("post_id", ids) : { data: [] as any },
      ids.length ? supabase.from("post_comments").select("post_id").in("post_id", ids) : { data: [] as any },
    ]);

    const authorMap = new Map((authors ?? []).map((a) => [a.id, a]));
    const likeMap = new Map<string, { count: number; mine: boolean }>();
    (likes ?? []).forEach((l: any) => {
      const cur = likeMap.get(l.post_id) ?? { count: 0, mine: false };
      cur.count += 1;
      if (l.user_id === user?.id) cur.mine = true;
      likeMap.set(l.post_id, cur);
    });
    const commentMap = new Map<string, number>();
    (comments ?? []).forEach((c: any) => commentMap.set(c.post_id, (commentMap.get(c.post_id) ?? 0) + 1));

    setPosts(rawPosts.map((p) => ({
      ...p,
      author: authorMap.get(p.author_id) as any,
      like_count: likeMap.get(p.id)?.count ?? 0,
      liked_by_me: likeMap.get(p.id)?.mine ?? false,
      comment_count: commentMap.get(p.id) ?? 0,
    })));
  };

  useEffect(() => { load(); }, [user?.id]);

  useEffect(() => {
    const ch = supabase.channel("posts-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const submit = async () => {
    if (!content.trim() || !user) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({ author_id: user.id, content: content.trim() });
    setPosting(false);
    if (error) return toast.error(error.message);
    setContent("");
    toast.success("Posted");
  };

  const toggleLike = async (post: Post) => {
    if (!user) return;
    if (post.liked_by_me) {
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
    }
    load();
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold text-primary-foreground">
              {profile?.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share an update, project, or opportunity…"
                className="min-h-[80px] bg-background/40 border-border/50 resize-none"
              />
              <div className="flex justify-end mt-3">
                <Button variant="hero" onClick={submit} disabled={posting || !content.trim()}>
                  <Send className="size-4" /> Post
                </Button>
              </div>
            </div>
          </div>
        </div>

        {posts.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center">
            <Sparkles className="size-8 text-accent mx-auto mb-2" />
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        )}

        {posts.map((p) => (
          <article key={p.id} className="glass-card rounded-2xl p-5">
            <header className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-full bg-gradient-accent grid place-items-center text-sm font-semibold text-accent-foreground">
                {p.author?.full_name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{p.author?.full_name ?? "Unknown"}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {p.author?.headline ?? p.author?.college_name ?? "Student"} · {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                </div>
              </div>
            </header>
            <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">{p.content}</p>
            <footer className="flex items-center gap-4 mt-4 pt-3 border-t border-border/40 text-sm">
              <button onClick={() => toggleLike(p)} className={`flex items-center gap-1.5 transition-colors ${p.liked_by_me ? "text-rose-400" : "text-muted-foreground hover:text-foreground"}`}>
                <Heart className={`size-4 ${p.liked_by_me ? "fill-current" : ""}`} /> {p.like_count}
              </button>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MessageCircle className="size-4" /> {p.comment_count}
              </span>
            </footer>
          </article>
        ))}
      </div>
    </AppShell>
  );
};

export default Feed;