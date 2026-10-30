import { useState, useEffect } from "react";
import { Bell, Info, AlertTriangle, XCircle, CheckCircle2, Megaphone } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchInAppNotifications, markNotificationAsRead, type SystemNotification } from "@/lib/system-config";
import { useNavigate } from "@tanstack/react-router";

export function InAppNotificationBell() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifs();
    // Poll every 30 seconds for live in-app notifications
    const interval = setInterval(loadNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadNotifs() {
    const list = await fetchInAppNotifications();
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.is_read).length);
  }

  async function handleNotificationClick(n: SystemNotification) {
    if (!n.is_read) {
      await markNotificationAsRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (n.action_url) {
      setOpen(false);
      navigate({ to: n.action_url as any });
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
      case "announcement":
        return <Megaphone className="h-4 w-4 text-purple-500 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors focus:outline-none"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 md:w-96 p-0 shadow-2xl border border-border/80 bg-card rounded-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">In-App Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px] font-bold py-0">
                {unreadCount} New
              </Badge>
            )}
          </div>
          <button
            onClick={() => loadNotifs()}
            className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-muted/40 ${
                  !n.is_read ? "bg-primary/5" : ""
                }`}
              >
                {getIcon(n.type)}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-semibold truncate ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(n.created_at).toLocaleDateString("en-QA", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
