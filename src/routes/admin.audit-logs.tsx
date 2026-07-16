import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/audit-logs")({
  component: AdminAuditLogs,
});

function AdminAuditLogs() {
  const [search, setSearch] = useState("");

  const logs = [
    { id: 1, actor: "Ahmad Al-Rashid", action: "CREATE", entity: "Lease", entity_id: "LS-001", timestamp: "2026-06-21 14:30", ip: "192.168.1.100" },
    { id: 2, actor: "Noura Al-Saud", action: "UPDATE", entity: "Unit", entity_id: "UN-042", timestamp: "2026-06-21 13:15", ip: "192.168.1.101" },
    { id: 3, actor: "Yousef Bin Hamad", action: "DELETE", entity: "Ticket", entity_id: "TK-156", timestamp: "2026-06-21 12:00", ip: "192.168.1.102" },
    { id: 4, actor: "Hala Al-Otaibi", action: "APPROVE", entity: "ApprovalRequest", entity_id: "AR-008", timestamp: "2026-06-21 11:45", ip: "192.168.1.103" },
    { id: 5, actor: "Faisal T.", action: "CREATE", entity: "MaintenanceTicket", entity_id: "MT-234", timestamp: "2026-06-21 10:30", ip: "192.168.1.104" },
  ];

  const filteredLogs = logs.filter((log) =>
    log.actor.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.entity.toLowerCase().includes(search.toLowerCase())
  );

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "APPROVE":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">System activity and changes</p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user, action, or entity..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="p-3 border rounded hover:bg-muted/50 text-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{log.actor}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Badge className={getActionColor(log.action)} variant="outline">
                          {log.action}
                        </Badge>
                        <span>{log.entity}</span>
                        <span className="font-mono">#{log.entity_id}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{log.timestamp}</p>
                      <p className="font-mono">{log.ip}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No logs found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
