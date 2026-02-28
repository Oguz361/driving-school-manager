import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  return withAdmin(request, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const days = parseInt(searchParams.get('days') || '7'); // Letzte N Tage

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const totalLogs = await prisma.activityLog.count();

      const logsInPeriod = await prisma.activityLog.count({
        where: {
          timestamp: { gte: startDate },
        },
      });

      const byAction = await prisma.activityLog.groupBy({
        by: ['action'],
        where: {
          timestamp: { gte: startDate },
        },
        _count: {
          action: true,
        },
      });

      const byEntityType = await prisma.activityLog.groupBy({
        by: ['entityType'],
        where: {
          timestamp: { gte: startDate },
        },
        _count: {
          entityType: true,
        },
      });

      const topUsers = await prisma.activityLog.groupBy({
        by: ['userId'],
        where: {
          timestamp: { gte: startDate },
        },
        _count: {
          userId: true,
        },
        orderBy: {
          _count: {
            userId: 'desc',
          },
        },
        take: 10,
      });

      const userIds = topUsers.map(u => u.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      const topUsersWithDetails = topUsers.map(tu => ({
        user: users.find(u => u.id === tu.userId),
        count: tu._count.userId,
      }));

      const failedLogins = await prisma.activityLog.count({
        where: {
          action: 'LOGIN_FAILED',
          timestamp: { gte: startDate },
        },
      });

      return NextResponse.json({
        period: {
          days,
          startDate,
          endDate: new Date(),
        },
        totals: {
          all: totalLogs,
          inPeriod: logsInPeriod,
        },
        byAction: byAction.map(item => ({
          action: item.action,
          count: item._count.action,
        })),
        byEntityType: byEntityType.map(item => ({
          entityType: item.entityType,
          count: item._count.entityType,
        })),
        topUsers: topUsersWithDetails,
        security: {
          failedLogins,
        },
      });
    } catch (error) {
      console.error('Get activity logs statistics error:', error);
      return NextResponse.json(
        { error: { message: 'Fehler beim Laden der Statistiken' } },
        { status: 500 }
      );
    }
  });
}