# ISR Revalidation Pattern

How to use Incremental Static Regeneration with on-demand revalidation.

## When to Use

Use ISR revalidation when you need to:
- Serve static content for performance
- Update content without full rebuilds
- Revalidate specific pages after data changes
- Cache expensive queries

## Architecture

```
┌─────────────────────────────────────────┐
│           ISR Revalidation              │
│                                         │
│  Request → Cache Check → Serve/Revalidate│
│     ↓          ↓            ↓           │
│  User      Fresh Data   Update Cache    │
│  Visit     Within TTL   on Change       │
│                                         │
└─────────────────────────────────────────┘
```

## Implementation Steps

### 1. Set Up ISR Page

Create a page with ISR:

```typescript
// apps/landing/app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

// Revalidate every 60 seconds
export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export default async function BlogPost({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    notFound();
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

### 2. On-Demand Revalidation

Create a revalidation API route:

```typescript
// apps/backoffice/app/api/revalidate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "CONTENT_PUBLISH");

    const body = await request.json();
    const { path, tag } = body;

    // Revalidate by path
    if (path) {
      revalidatePath(path);
    }

    // Revalidate by tag
    if (tag) {
      revalidateTag(tag);
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { revalidated: false },
      { status: 401 }
    );
  }
}
```

### 3. Tag-Based Revalidation

Use fetch with tags for granular cache control:

```typescript
// apps/landing/app/blog/page.tsx
export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    // This cache is tagged with 'posts'
    cache: {
      swr: 60,
      tags: ["posts"],
    },
  });

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  );
}

// Revalidate all tagged queries
// In API route or server action:
import { revalidateTag } from "next/cache";

revalidateTag("posts"); // Invalidates all queries tagged with 'posts'
```

### 4. Revalidate After Mutations

Revalidate cache after data changes:

```typescript
// apps/backoffice/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/auth/permissions";
import { createPost } from "@/lib/services/post-service";

export async function POST(request: NextRequest) {
  const session = await requireAuth();

  const body = await request.json();
  const post = await createPost(body);

  // Revalidate pages that display posts
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]");
  revalidateTag("posts");

  return NextResponse.json(post);
}
```

### 5. Revalidate in Server Actions

```typescript
// apps/backoffice/app/actions/post-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/config";
import { updatePost } from "@/lib/services/post-service";

export async function updatePostAction(formData: FormData) {
  const session = await auth();

  const postId = formData.get("postId") as string;
  const title = formData.get("title") as string;

  await updatePost(postId, { title });

  // Revalidate cache
  revalidatePath("/blog");
  revalidatePath(`/blog/${postId}`);

  return { success: true };
}
```

## Revalidation Patterns

### Time-Based Revalidation

```typescript
// Revalidate every hour
export const revalidate = 3600;

export default async function Page() {
  // Fetch data
  const data = await fetchData();
  return <div>{/* ... */}</div>;
}
```

### On-Demand Revalidation

```typescript
// No automatic revalidation
export const revalidate = false;

// Manual trigger via API
// POST /api/revalidate { path: "/about" }
```

### Tag-Based Revalidation

```typescript
// Cache with tags
const data = await prisma.post.findMany({
  cache: { tags: ["blog-posts", "homepage"] },
});

// Revalidate specific tags
revalidateTag("blog-posts");
```

### Stale-While-Revalidate

```typescript
// Using Next.js fetch with SWR
const data = await fetch("https://api.example.com/data", {
  next: {
    revalidate: 60, // Revalidate every 60 seconds
  },
});
```

## Examples from Landing Page

The landing page demonstrates ISR revalidation:

```typescript
// apps/landing/app/api/revalidate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isValidSecret } from "@/lib/revalidate/secret";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, path } = body;

    // Verify secret for security
    if (!isValidSecret(secret)) {
      return NextResponse.json(
        { message: "Invalid secret" },
        { status: 401 }
      );
    }

    // Revalidate the path
    revalidatePath(path);

    return NextResponse.json({ revalidated: true });
  } catch (err) {
    return NextResponse.json(
      { revalidated: false },
      { status: 400 }
    );
  }
}
```

Trigger revalidation from webhook or external service:

```bash
curl -X POST https://yourdomain.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-webhook-secret",
    "path": "/blog"
  }'
```

## Advanced Patterns

### Conditional Revalidation

```typescript
export async function POST(request: NextRequest) {
  const { path, condition } = await request.json();

  if (condition === "urgent") {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true });
}
```

### Batch Revalidation

```typescript
export async function POST(request: NextRequest) {
  const { paths } = await request.json();

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, count: paths.length });
}
```

### Tag-Based Invalidation

```typescript
// Tag related content
const posts = await prisma.post.findMany({
  cache: { tags: [`posts-${categoryId}`, "all-posts"] },
});

// Invalidate all posts in category
revalidateTag(`posts-${categoryId}`);

// Invalidate all posts
revalidateTag("all-posts");
```

## Best Practices

1. **Use Tags**: Tag related content for batch invalidation
2. **Webhook Security**: Always verify webhook secrets
3. **Granular Revalidation**: Revalidate specific paths, not everything
4. **Background Revalidation**: Use SWR for seamless updates
5. **Cache Warming**: Pre-warm cache for important pages
6. **Monitor Cache**: Track cache hit/miss ratios

## Revalidation Triggers

Common revalidation triggers:

1. **Webhooks**: From CMS or external services
2. **Admin Actions**: After content changes
3. **Scheduled**: Cron jobs for periodic updates
4. **Manual**: Admin panel button
5. **Automatic**: After database mutations

## Cache Strategy Decision Tree

```
Is the content user-specific?
├─ Yes: Use dynamic rendering (no caching)
└─ No: Is it personalized per user?
   ├─ Yes: Use middleware/cookies
   └─ No: Does it change frequently?
      ├─ Yes: Use ISR with short revalidate time
      └─ No: Use static generation or ISR with long revalidate time
```

## See Also

- [API Routes](/docs/patterns/api-routes) - Creating revalidation endpoints
- [Service Layer](/docs/patterns/service-layer) - Integrating revalidation
- [Data Flow](/docs/architecture/data-flow) - How data moves through the system
