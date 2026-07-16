import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { communityPosts, communityEvents } from "@/lib/mock-data";

const posts = communityPosts;
const events = communityEvents;

export const Route = createFileRoute("/portal/community")({
  head: () => ({ meta: [{ title: "Community — ZYNO Property Management Portal" }] }),
  component: CommunityPage,
});

function CommunityPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {posts.map(p => (
          <Card key={p.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {p.author.split(" ").map(s => s[0]).slice(0, 2).join("")}
                </span>
                <div>
                  <p className="text-sm font-medium">{p.author}</p>
                  <p className="text-xs text-muted-foreground">{p.time} ago</p>
                </div>
              </div>
              <h3 className="mt-3 text-base font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
              <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                <button className="hover:text-foreground">👍 Like</button>
                <button className="hover:text-foreground">💬 Comment</button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-fit">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold">Upcoming events</h3>
          <ul className="mt-4 space-y-3">
            {events.map(e => (
              <li key={e.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.when}</p>
                </div>
                <Button size="sm" variant="ghost">RSVP</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
