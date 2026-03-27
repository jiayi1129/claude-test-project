import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "My Membership | FitBook",
};

export default function MembershipPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Membership</h1>
        <p className="text-muted-foreground">
          Manage your membership plan and credits
        </p>
      </div>

      {/* Current membership */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            <Badge variant="outline">No Active Plan</Badge>
          </div>
          <CardDescription>
            You don&apos;t have an active membership
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">
              Browse available plans below to get started
            </p>
            <Badge variant="outline" className="mt-4">
              Placeholder
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Credits */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Balance</CardTitle>
          <CardDescription>Your available class credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">0</div>
          <p className="text-sm text-muted-foreground mt-1">
            credits remaining
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Available plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Placeholder plan cards */}
          {["Unlimited Monthly", "8-Class Pack", "Drop-In"].map((plan) => (
            <Card key={plan}>
              <CardHeader>
                <CardTitle className="text-lg">{plan}</CardTitle>
                <CardDescription>Plan description placeholder</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$0</div>
                <p className="text-sm text-muted-foreground">per month</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Select Plan</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
