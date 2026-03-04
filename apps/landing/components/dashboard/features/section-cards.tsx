import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Revenue Card */}
      <Card className="border-border/50 bg-card/50 @container/card backdrop-blur-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            Total Revenue
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $1,250.00
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-primary/30/50 bg-primary-lighter/50 text-primary-hover dark:border-primary/20 dark:bg-primary/10 dark:text-primary"
            >
              <IconTrendingUp className="size-3.5" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>

      {/* New Customers Card */}
      <Card className="border-border/50 bg-card/50 @container/card backdrop-blur-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            New Customers
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-red-200/50 bg-red-50/50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
            >
              <IconTrendingDown className="size-3.5" />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>

      {/* Active Accounts Card */}
      <Card className="border-border/50 bg-card/50 @container/card backdrop-blur-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            Active Accounts
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-primary/30/50 bg-primary-lighter/50 text-primary-hover dark:border-primary/20 dark:bg-primary/10 dark:text-primary"
            >
              <IconTrendingUp className="size-3.5" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>

      {/* Growth Rate Card */}
      <Card className="border-border/50 bg-card/50 @container/card backdrop-blur-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            Growth Rate
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-primary/30/50 bg-primary-lighter/50 text-primary-hover dark:border-primary/20 dark:bg-primary/10 dark:text-primary"
            >
              <IconTrendingUp className="size-3.5" />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  );
}
