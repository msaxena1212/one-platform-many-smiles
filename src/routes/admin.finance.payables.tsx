import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export const Route = createFileRoute("/admin/finance/payables")({
  component: OwnerPayablesPage,
});

function OwnerPayablesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Owner Payables</h2>
          <p className="text-sm text-muted-foreground">Manage revenue share distributions to property owners.</p>
        </div>
      </div>

      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
            <Info className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-lg">No Pending Payables</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Owner payables are automatically calculated at the end of each period based on posted revenue and expenses.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
