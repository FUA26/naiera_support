import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Activity,
  CreditCard,
  DollarSign,
  LucideIcon,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const stats = [
    {
      title: "Total Users",
      value: "2,350",
      description: "+20.1% from last month",
      icon: Users,
    },
    {
      title: "Active Sessions",
      value: "145",
      description: "+12% from last hour",
      icon: Activity,
    },
    {
      title: "Total Revenue",
      value: "$45,231.89",
      description: "+19% from last month",
      icon: DollarSign,
    },
    {
      title: "Subscriptions",
      value: "+573",
      description: "+201 since last month",
      icon: CreditCard,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
