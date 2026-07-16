import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import { mockOwnerStatements } from "@/lib/mock-data";

export const Route = createFileRoute("/owner/statements")({
  component: OwnerStatements,
});

function OwnerStatements() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owner Statements</h1>
          <p className="text-sm text-muted-foreground mt-1">Monthly revenue, distributions and charges</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gross Revenue (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₨450,000</p>
            <p className="text-xs text-muted-foreground">6 properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expenses (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₨82,500</p>
            <p className="text-xs text-muted-foreground">maintenance + shared services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net Payable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">₨367,500</p>
            <p className="text-xs text-muted-foreground">pending distribution</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Statements</CardTitle>
          <CardDescription>Download or view detailed statements for each period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockOwnerStatements.map((stmt) => (
              <div key={stmt.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <p className="font-medium">{stmt.period}</p>
                  <p className="text-sm text-muted-foreground">
                    Gross: ₨{stmt.gross_revenue.toLocaleString()} • Net: ₨{stmt.net_payable.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
