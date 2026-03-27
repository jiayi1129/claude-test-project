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
  title: "My Bookings | FitBook",
};

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">
          View and manage your class bookings
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
              <CardDescription>
                Classes you&apos;re booked into
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg font-medium">No upcoming bookings</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse the schedule to book your next class
                </p>
                <Badge variant="outline" className="mt-4">
                  Placeholder
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Past Bookings</CardTitle>
              <CardDescription>Your class history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg font-medium">No past bookings</p>
                <Badge variant="outline" className="mt-4">
                  Placeholder
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Waitlisted Classes</CardTitle>
              <CardDescription>
                Classes you&apos;re on the waitlist for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg font-medium">
                  You&apos;re not on any waitlists
                </p>
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
