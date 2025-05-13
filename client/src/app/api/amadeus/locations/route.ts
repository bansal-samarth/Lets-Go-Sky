// src/app/api/amadeus/locations/route.ts
import { NextRequest, NextResponse } from "next/server";

const AMADEUS_BASE = "https://test.api.amadeus.com/v1/reference-data/locations";
const AMADEUS_TOKEN_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";

// In-memory cache for token (optional)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }

  const clientId = "ev9ZwYLOcoD5wWnzruNWlixyAH3kVnh6"; // process.env.AMADEUS_CLIENT_ID;
  const clientSecret = "492LW6sEGJD2V7gh"; // process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing AMADEUS_CLIENT_ID or AMADEUS_CLIENT_SECRET in environment"
    );
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const tokenRes = await fetch(AMADEUS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Failed to fetch Amadeus token: ${tokenRes.status} – ${err}`);
  }

  const { access_token, expires_in } = await tokenRes.json();
  // Cache a bit before actual expiry
  cachedToken = {
    token: access_token,
    expiresAt: now + (expires_in - 60) * 1000,
  };
  return access_token;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const keyword = searchParams.get("keyword") || "";
    const countryCode = searchParams.get("countryCode") || "IN";

    const token = await getAccessToken();

    const url = `${AMADEUS_BASE}?subType=CITY,AIRPORT&keyword=${encodeURIComponent(
      keyword
    )}&countryCode=${countryCode}`;

    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json(
        { error: `Amadeus API error ${resp.status}: ${err}` },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Unknown error" },
      { status: 500 }
    );
  }
}
