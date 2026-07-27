/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/// <reference types="@fastly/js-compute" />

import { getGeolocationForIpAddress } from "fastly:geolocation";

/**
 * Returns the visitor's geolocation (derived from their IP by Fastly) as
 * JSON, and mirrors the country/region onto both response headers and a
 * short-lived cookie so client-side code (Target profile params, block
 * personalization, etc.) can read it without an extra round trip on
 * subsequent requests.
 *
 * GET /api/geo
 */
async function geoHandler(req, client) {
  // Prefer the leftmost IP in X-Forwarded-For (original client) over
  // client.address, which is typically just the nearest CDN edge node.
  const xff = req.headers.get("x-forwarded-for");
  const clientIp = xff ? xff.split(",")[0].trim() : client?.address;

  const geo = clientIp ? getGeolocationForIpAddress(clientIp) : null;

  const payload = {
    country: geo?.countryCode ?? null,
    region: geo?.region ?? null,
    city: geo?.city ?? null,
    continent: geo?.continentCode ?? null,
    latitude: geo?.latitude ?? null,
    longitude: geo?.longitude ?? null,
  };

  const cookieParts = [
    `sw-geo=${encodeURIComponent(JSON.stringify({ country: payload.country, region: payload.region }))}`,
    "Path=/",
    "Max-Age=86400",
    "SameSite=Lax",
  ];

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      // Geo varies per visitor IP, so this must never be cached shared —
      // the CDN origin-selector rule for this path also sets skipCache.
      "Cache-Control": "private, max-age=300",
      "X-Geo-Country": payload.country ?? "",
      "X-Geo-Region": payload.region ?? "",
      "Set-Cookie": cookieParts.join("; "),
    },
  });
}

export { geoHandler };
