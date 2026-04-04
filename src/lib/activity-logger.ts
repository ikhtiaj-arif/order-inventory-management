/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntityType, Prisma } from '@/generated/prisma'
import { prisma } from './db'


export interface LogActivityParams {
  userId: string
  action: string
  entityType: EntityType
  entityId: string
  details?: Prisma.InputJsonValue
}

/**
 * Log an activity to the ActivityLog table
 */
export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  details,
}: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        ...(details !== undefined && { details }),
      },
    })
  } catch (error) {
    // Log errors but don't throw - activity logging should not break the main flow
    console.error('[ActivityLog] Error logging activity:', error)
  }
}

/**
 * Get recent activity logs for a user
 */
export async function getRecentActivityLogs(
  userId: string,
  limit: number = 10,
  offset: number = 0
) {
  return prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      details: true,
      createdAt: true,
    },
  })
}

/**
 * Get activity logs by entity type
 */
export async function getActivityLogsByEntityType(
  userId: string,
  entityType: EntityType,
  limit: number = 10
) {
  return prisma.activityLog.findMany({
    where: {
      userId,
      entityType,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
