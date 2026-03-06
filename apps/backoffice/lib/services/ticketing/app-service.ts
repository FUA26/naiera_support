/**
 * App & Channel Management Service
 *
 * Handles CRUD operations for Apps and Channels in the ticketing system.
 */

import { prisma } from "@/lib/prisma";
import type {
  App,
  Channel,
  ChannelType,
  Prisma,
} from "@prisma/client";

// Types
export interface CreateAppInput {
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateAppInput {
  name?: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface CreateChannelInput {
  appId: string;
  name: string;
  type: ChannelType;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateChannelInput {
  name?: string;
  type?: ChannelType;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export interface AppWithChannels extends App {
  channels: Channel[];
  _count: {
    tickets: number;
  };
}

export interface ListAppsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedApps {
  items: AppWithChannels[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Generate a unique slug for an app
 */
export async function generateAppSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let counter = 0;
  let uniqueSlug = slug;

  while (await prisma.app.findUnique({ where: { slug: uniqueSlug } })) {
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Generate a secure API key for integrated app channels
 */
export function generateApiKey(): string {
  const prefix = "tk_";
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = prefix;
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * List all apps with pagination
 */
export async function listApps(
  params: ListAppsParams
): Promise<PaginatedApps> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const skip = (page - 1) * pageSize;

  const where: Prisma.AppWhereInput = {
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: "insensitive" } },
        { slug: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ],
    }),
    ...(params.isActive !== undefined && { isActive: params.isActive }),
  };

  const [items, total] = await Promise.all([
    prisma.app.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        channels: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    }),
    prisma.app.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get an app by ID
 */
export async function getApp(id: string): Promise<AppWithChannels | null> {
  return prisma.app.findUnique({
    where: { id },
    include: {
      channels: {
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });
}

/**
 * Get an app by slug
 */
export async function getAppBySlug(
  slug: string
): Promise<AppWithChannels | null> {
  return prisma.app.findUnique({
    where: { slug },
    include: {
      channels: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });
}

/**
 * Create a new app
 */
export async function createApp(
  data: CreateAppInput,
  createdById: string
): Promise<App> {
  // Check if slug already exists
  const existing = await prisma.app.findUnique({
    where: { slug: data.slug },
  });

  if (existing) {
    throw new Error(`App with slug "${data.slug}" already exists`);
  }

  const app = await prisma.app.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      isActive: data.isActive ?? true,
    },
  });

  return app;
}

/**
 * Update an app
 */
export async function updateApp(
  id: string,
  data: UpdateAppInput,
  updatedById: string
): Promise<App> {
  const existing = await prisma.app.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`App with ID "${id}" not found`);
  }

  // Check slug uniqueness if changing
  if (data.slug && data.slug !== existing.slug) {
    const slugExists = await prisma.app.findUnique({
      where: { slug: data.slug },
    });

    if (slugExists) {
      throw new Error(`App with slug "${data.slug}" already exists`);
    }
  }

  const app = await prisma.app.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  return app;
}

/**
 * Delete an app
 */
export async function deleteApp(id: string, deletedById: string): Promise<void> {
  const existing = await prisma.app.findUnique({
    where: { id },
    include: {
      _count: {
        select: { tickets: true },
      },
    },
  });

  if (!existing) {
    throw new Error(`App with ID "${id}" not found`);
  }

  if (existing._count.tickets > 0) {
    throw new Error(
      `Cannot delete app with ${existing._count.tickets} associated tickets`
    );
  }

  await prisma.app.delete({
    where: { id },
  });
}

/**
 * Create a new channel
 */
export async function createChannel(
  data: CreateChannelInput,
  createdById: string
): Promise<Channel> {
  // Verify app exists
  const app = await prisma.app.findUnique({
    where: { id: data.appId },
  });

  if (!app) {
    throw new Error(`App with ID "${data.appId}" not found`);
  }

  // Generate API key for INTEGRATED_APP channels
  const apiKey = data.type === "INTEGRATED_APP" ? generateApiKey() : null;

  const channel = await prisma.channel.create({
    data: {
      appId: data.appId,
      name: data.name,
      type: data.type,
      apiKey,
      config: (data.config ?? {}) as any,
      isActive: data.isActive ?? true,
    },
  });

  return channel;
}

/**
 * Update a channel
 */
export async function updateChannel(
  id: string,
  data: UpdateChannelInput,
  updatedById: string
): Promise<Channel> {
  const existing = await prisma.channel.findUnique({
    where: { id },
    include: { app: true },
  });

  if (!existing) {
    throw new Error(`Channel with ID "${id}" not found`);
  }

  const channel = await prisma.channel.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.config !== undefined && { config: data.config as any }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  return channel;
}

/**
 * Delete a channel
 */
export async function deleteChannel(
  id: string,
  deletedById: string
): Promise<void> {
  const existing = await prisma.channel.findUnique({
    where: { id },
    include: {
      _count: {
        select: { tickets: true },
      },
    },
  });

  if (!existing) {
    throw new Error(`Channel with ID "${id}" not found`);
  }

  if (existing._count.tickets > 0) {
    throw new Error(
      `Cannot delete channel with ${existing._count.tickets} associated tickets`
    );
  }

  await prisma.channel.delete({
    where: { id },
  });
}

/**
 * Get all channels for an app
 */
export async function getAppChannels(appId: string): Promise<Channel[]> {
  return prisma.channel.findMany({
    where: { appId },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Get a channel by ID
 */
export async function getChannel(id: string): Promise<Channel | null> {
  return prisma.channel.findUnique({
    where: { id },
    include: { app: true },
  });
}
