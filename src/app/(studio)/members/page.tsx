import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Members | FitBook Studio",
};

export default function MembersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            Manage your studio&apos;s member base
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members by name, email, or phone..."
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
          <CardDescription>
            A list of all members in your studio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium">No members yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first member or invite them to register online
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
