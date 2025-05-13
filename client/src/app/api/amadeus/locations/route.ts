// src/app/api/amadeus/locations/route.ts
import { NextRequest, NextResponse } from 'next/server'

const AMADEUS_BASE = 'https://test.api.amadeus.com/v1/reference-data/locations'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const keyword = searchParams.get('keyword') || ''
  const countryCode = searchParams.get('countryCode') || 'IN'

  // Fetch your OAuth token however you manage it;
  // here assumed available as env var
  const token = "zJ89GeuTmFzwsD7psZi15cDOnKhZ"

  const url = `${AMADEUS_BASE}?subType=CITY,AIRPORT&keyword=${encodeURIComponent(keyword)}&countryCode=${countryCode}`
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const data = await resp.json()
  return NextResponse.json(data)
}
