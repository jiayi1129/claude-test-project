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
import { UserPlus } from "lucide-react";

export const metadata: Metadata = {
  title: "Staff | FitBook Studio",
};

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
          <p className="text-muted-foreground">
            Manage instructors and front desk staff
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Staff
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>
            All instructors and front desk staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium">No staff members yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Invite your first instructor or front desk staff member
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
