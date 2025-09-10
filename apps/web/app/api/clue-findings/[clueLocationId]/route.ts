import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { clueLocationId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const timeframeYears = parseInt(searchParams.get('timeframe') || '2');
    
    if (!gameId) {
      return NextResponse.json({ error: 'gameId parameter is required' }, { status: 400 });
    }

    // Calculate date threshold for "All Games" section
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - timeframeYears);

    // First, get clue location info
    const clueLocationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/clue-locations/${params.clueLocationId}`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!clueLocationResponse.ok) {
      return NextResponse.json({ error: 'Clue location not found' }, { status: 404 });
    }

    const clueLocation = await clueLocationResponse.json();

    // Get findings from current game
    const currentGameFindingsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/clue-findings/by-game-clue?gameId=${gameId}&clueLocationId=${params.clueLocationId}`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    // Get findings from all games (last 2 years, excluding current game)
    const allGamesFindingsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/clue-findings/by-clue-location/${params.clueLocationId}?excludeGameId=${gameId}&since=${twoYearsAgo.toISOString()}`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    const currentGameFindings = currentGameFindingsResponse.ok ? await currentGameFindingsResponse.json() : [];
    const allGamesFindings = allGamesFindingsResponse.ok ? await allGamesFindingsResponse.json() : [];

    // Reverse geocode addresses for findings if needed
    const findingsWithAddresses = async (findings: any[]) => {
      return Promise.all(
        findings.map(async (finding: any) => {
          if (finding.gpsLatitude && finding.gpsLongitude) {
            try {
              const geocodeResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/geocode/reverse?lat=${finding.gpsLatitude}&lng=${finding.gpsLongitude}`,
                {
                  headers: {
                    'Cookie': request.headers.get('cookie') || '',
                  },
                }
              );
              if (geocodeResponse.ok) {
                const geocodeData = await geocodeResponse.json();
                return { ...finding, address: geocodeData.formatted_address || geocodeData.address };
              }
            } catch (error) {
              console.warn('Failed to geocode address for finding:', finding.id);
            }
          }
          return { ...finding, address: 'Location not available' };
        })
      );
    };

    const currentGameFindingsWithAddresses = await findingsWithAddresses(currentGameFindings);
    const allGamesFindingsWithAddresses = await findingsWithAddresses(allGamesFindings);

    const response = {
      currentGameFindings: currentGameFindingsWithAddresses,
      allGamesFindings: allGamesFindingsWithAddresses,
      clueInfo: {
        id: clueLocation.id,
        identifyingName: clueLocation.identifyingName,
        anonymizedName: clueLocation.anonymizedName,
        text: clueLocation.text,
        hint: clueLocation.hint,
        latitude: clueLocation.latitude,
        longitude: clueLocation.longitude,
      },
      totalCurrentGame: currentGameFindingsWithAddresses.length,
      totalAllGames: allGamesFindingsWithAddresses.length,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching clue findings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clue findings' },
      { status: 500 }
    );
  }
}