import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  return withAdmin(request, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const userId = searchParams.get('userId');
      const action = searchParams.get('action');
      const entityType = searchParams.get('entityType');
      const entityId = searchParams.get('entityId');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const skip = (page - 1) * limit;

      const where: any = {};

      if (userId) {
        where.userId = userId;
      }

      if (action) {
        where.action = action;
      }

      if (entityType) {
        where.entityType = entityType;
      }

      if (entityId) {
        where.entityId = entityId;
      }

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) {
          where.timestamp.gte = new Date(startDate);
        }
        if (endDate) {
          where.timestamp.lte = new Date(endDate);
        }
      }

      const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { timestamp: 'desc' },
          skip,
          take: limit,
        }),
        prisma.activityLog.count({ where }),
      ]);

      return NextResponse.json({
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error('Get activity logs error:', error);
      return NextResponse.json(
        { error: { message: 'Fehler beim Laden der Activity Logs' } },
        { status: 500 }
      );
    }
  });
}