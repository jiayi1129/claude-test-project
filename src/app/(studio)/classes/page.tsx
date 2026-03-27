import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Classes | FitBook Studio",
};

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">
            Manage your class schedule and templates
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Class
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Schedule</CardTitle>
          <CardDescription>All upcoming class sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium">No classes scheduled</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first class template to get started
            </p>
            <Badge variant="outline" className="mt-4">
              Placeholder
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
