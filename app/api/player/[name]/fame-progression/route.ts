import { NextResponse } from "next/server";
import { withPrisma } from "@/lib/prisma-helper";
import { format, startOfDay, subDays } from "date-fns";
import { MurderLedgerEvent } from "@/types/albion";

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const playerName = params.name.toLowerCase();
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || '7d';

  try {
    // Calculate the start date based on the selected period
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case '14d':
        startDate = subDays(now, 14);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default: // '7d'
        startDate = subDays(now, 7);
    }

    // Get all events for the player within the selected period
    const events = await withPrisma(prisma =>
      prisma.playerEvent.findMany({
        where: { 
          playerName,
          timestamp: {
            gte: period === 'all' ? undefined : startDate
          }
        },
        orderBy: { timestamp: 'asc' },
        select: {
          timestamp: true,
          eventData: true
        }
      })
    );

    // Group events by day and calculate PVP fame
    const fameByDay = new Map<string, number>();

    events.forEach(event => {
      const day = format(startOfDay(event.timestamp), 'MM/dd');
      const eventData = event.eventData as unknown as MurderLedgerEvent;
      
      // Add kill fame if player is killer
      if (eventData.killer?.name?.toLowerCase() === playerName) {
        const currentFame = fameByDay.get(day) || 0;
        fameByDay.set(day, currentFame + (eventData.total_kill_fame || 0));
      }
    });

    // Convert to array format for the chart
    const fameData = Array.from(fameByDay.entries()).map(([date, fame]) => ({
      date,
      fame
    }));

    return NextResponse.json(fameData);
  } catch (error) {
    console.error('Error fetching fame progression:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fame progression' },
      { status: 500 }
    );
  }
} 