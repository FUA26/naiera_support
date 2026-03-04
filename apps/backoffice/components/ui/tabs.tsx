"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("gap-2 group/tabs flex flex-col data-[orientation=vertical]:flex-row", className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "rounded-lg p-[3px] group-data-horizontal/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "gap-1.5 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-in-out",
        "group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none",
        "[&_svg:not([class*='size-'])]:size-4 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring",
        "text-foreground/60 hover:text-foreground hover:bg-muted/50 dark:text-muted-foreground dark:hover:text-foreground",
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start",
        "focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",

        // Variant: Line
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",

        // Active State Colors
        "data-active:bg-background data-active:text-primary dark:data-active:text-primary dark:data-active:border-input dark:data-active:bg-input/30",
        "group-data-horizontal/tabs:data-active:bg-background group-data-horizontal/tabs:data-active:shadow-sm",
        "group-data-vertical/tabs:data-active:bg-primary/5 group-data-vertical/tabs:data-active:shadow-none",

        // Animated Indigo Underline/Side-line (Premium Detail)
        "after:bg-primary after:absolute after:opacity-0 after:transition-all after:duration-300",
        "group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-2px] group-data-horizontal/tabs:after:h-0.5 group-data-horizontal/tabs:data-active:after:opacity-100 group-data-horizontal/tabs:after:rounded-t-md",
        "group-data-vertical/tabs:after:inset-y-1.5 group-data-vertical/tabs:after:left-0 group-data-vertical/tabs:after:w-[3px] group-data-vertical/tabs:data-active:after:opacity-100 group-data-vertical/tabs:after:rounded-r-md",

        // After element visibility for line variant
        "group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("text-sm flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, tabsListVariants, TabsTrigger };
