import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

export const Route = createFileRoute("/maintenance/")({
  component: MaintenanceDashboard,
});

const MaintenanceModule = lazy(() =>
  import("@/components/maintenance-module").then((m) => ({ default: m.MaintenanceModule }))
);

function MaintenanceDashboard() {
  return (
    <ModuleSuspense>
      <MaintenanceModule role="maintenance" />
    </ModuleSuspense>
  );
  /* return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Ops</h1>
          <p className="text-muted-foreground mt-1">Track issues, dispatch workers, and monitor facility health.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tickets</CardTitle>
            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Wrench className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{openTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently open or in progress
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Urgent Issues</CardTitle>
            <div className="h-9 w-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{urgentTickets}</div>
            <p className="text-xs text-red-500 mt-1">
              Requires immediate dispatch
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved (30d)</CardTitle>
            <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{resolvedTickets}</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              Successfully closed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Ticket Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#334155' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Needs Attention</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary h-8 text-xs gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved')
            const MaintenanceModule = lazy(() =>
              import("@/components/maintenance-module").then((m) => ({ default: m.MaintenanceModule }))
            );
            </div>
            function MaintenanceDashboard() {
              return (
                <ModuleSuspense>
                  <MaintenanceModule role="maintenance" />
                </ModuleSuspense>
              );
            }
          </CardContent>
        </Card>
      </div>
    </div>
  ); */
}
