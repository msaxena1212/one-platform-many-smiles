import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Plus, Users, Briefcase, FileDown, FileUp, Building2, UserCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/hrms")({
  component: HRMSPage,
});

function HRMSPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: deptData } = await supabase.from('departments').select('*');
      setDepartments(deptData || []);

      const { data: empData } = await supabase.from('employees')
        .select(`*, departments(name), designations(title)`);
      setEmployees(empData || []);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = () => {
    alert("Export functionality would generate a CSV of employees.");
  };

  const handleImport = () => {
    alert("Import functionality would open a dialog to upload an Excel file and sync data.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HRMS Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage employees, departments, and roles.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <FileDown className="h-4 w-4" /> Export
          </Button>
          <Button variant="outline" onClick={handleImport} className="gap-2">
            <FileUp className="h-4 w-4" /> Sync / Import
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
              <h3 className="text-3xl font-bold mt-2">{employees.length}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Departments</p>
              <h3 className="text-3xl font-bold mt-2">{departments.length}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Roles</p>
              <h3 className="text-3xl font-bold mt-2">{new Set(employees.map(e => e.designations?.title)).size}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-2">
          <TabsTrigger value="employees">Directory</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Employee Directory</CardTitle>
              <Input placeholder="Search employees..." className="max-w-xs" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">Loading employees...</div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="p-3 font-medium">Employee</th>
                        <th className="p-3 font-medium">ID Code</th>
                        <th className="p-3 font-medium">Department</th>
                        <th className="p-3 font-medium">Role</th>
                        <th className="p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-muted/50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <UserCircle className="h-8 w-8 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{emp.first_name} {emp.last_name}</div>
                                <div className="text-xs text-muted-foreground">{emp.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">{emp.employee_id_code}</td>
                          <td className="p-3">{emp.departments?.name || '-'}</td>
                          <td className="p-3">{emp.designations?.title || '-'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.employee_status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {emp.employee_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {employees.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-muted-foreground">
                            No employees found. Run sync to populate data.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Departments</CardTitle>
              <Button size="sm"><Plus className="h-4 w-4 mr-2"/> Add Department</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-4 border rounded hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{dept.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {employees.filter(e => e.department_id === dept.id).length} Employees
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
