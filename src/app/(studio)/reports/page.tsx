import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Reports | FitBook Studio",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Business analytics and performance insights
        </p>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Report</CardTitle>
              <CardDescription>
                Total revenue breakdown by payment type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg font-medium">No revenue data</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Revenue data will appear once payments are processed
                </p>
                <Badge variant="outline" className="mt-4">
                  Placeholder
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Report</CardTitle>
              <CardDescription>
                Class fill rates and attendance trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg font-medium">No attendance data</p>
                <Badge variant="outline" className="mt-4">
                  Placeholder
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="membership" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Membership Report</CardTitle>
              <CardDescription>
                Active members, MRR, and retention metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg font-medium">No membership data</p>
                <Badge variant="outline" className="mt-4">
                  Placeholder
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Report</CardTitle>
              <CardDescription>
                Pay owed per instructor for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg font-medium">No payroll data</p>
                <Badge variant="outline" className="mt-4">
                  Placeholder
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
