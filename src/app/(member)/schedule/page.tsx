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
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

export const metadata: Metadata = {
  title: "Class Schedule | FitBook",
};

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Class Schedule</h1>
        <p className="text-muted-foreground">
          Browse and book upcoming classes
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by class type, instructor..."
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Classes</CardTitle>
          <CardDescription>
            Available classes for the next 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium">No classes available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check back soon for upcoming classes
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
