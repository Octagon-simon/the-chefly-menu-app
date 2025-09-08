import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import type { Brand } from "@/types/menu";
import { MetadataRoute } from "next";
import { formatText, getFirstWord } from "@/lib/utils";

/** If the stored URL is a Cloudinary URL, inject transformation params for size.
 *  Otherwise return the original URL unchanged.
 */
function getCloudinaryUrl(url: string, size: number) {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${size},h_${size},c_fill,g_auto/`);
}

/** Generate a small SVG initials fallback and return as a data URI (utf8 encoded) */
function generateFallbackIconDataUri(name: string, size: number) {
  const initials = (name || "")
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
  const radius = Math.round(size / 6);
  const textSize = Math.round(size / 2);

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
    <rect width='100%' height='100%' rx='${radius}' fill='#f97316'/>
    <text x='50%' y='50%' font-size='${textSize}' font-family='Arial, Helvetica, sans-serif'
      fill='white' text-anchor='middle' dominant-baseline='central'>${initials}</text>
  </svg>`;

  // Use utf8 data uri (avoids Buffer so it works in edge environments)
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export async function GET(
  _request: Request,
  { params }: { params: { username: string } }
) {
  const { username } = params;

  const userPublicSnap = await get(ref(db, "userPublic"));

  let userId: string | null = null;

  userPublicSnap.forEach((snap) => {
    if (snap.val().username === username) userId = snap.key!;
  });

  let restaurantName = formatText(username);
  let description: string | null = null;
  let primaryColor: string | null = null;
  let logo192: string | null = null;
  let logo512: string | null = null;

  if (userId) {
    const brandSnap = await get(ref(db, `brands/${userId}`));
    if (brandSnap.exists()) {
      const brand = brandSnap.val() as Brand;
      restaurantName = formatText(brand.name || username);
      description = brand.description || null;
      primaryColor = brand.primaryColor || null;

      if (brand.logo) {
        // Use Cloudinary transforms when possible, otherwise use the given URL
        logo192 = getCloudinaryUrl(brand.logo, 192) || brand.logo;
        logo512 = getCloudinaryUrl(brand.logo, 512) || brand.logo;
      }
    }
  }

  // Generated fallbacks (initials)
  const fallback192 = generateFallbackIconDataUri(restaurantName, 192);
  const fallback512 = generateFallbackIconDataUri(restaurantName, 512);

  // OPTIONAL: temporarily use global Chefly assets instead of initials
  // uncomment these lines to use brand images hosted in /public
  // const fallback192 = `${process.env.NEXT_PUBLIC_APP_URL}/cheflymenuapp-192.png`;
  // const fallback512 = `${process.env.NEXT_PUBLIC_APP_URL}/cheflymenuapp-512.png`;

  const manifest: MetadataRoute.Manifest = {
    id: `/${username}`,
    name: `${getFirstWord(restaurantName)} Menu`,
    short_name: `${getFirstWord(restaurantName)} Menu`,
    description: description || `Digital menu for ${restaurantName}`,
    start_url: `/${username}`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: primaryColor || "#f97316",
    icons: [
      {
        src: logo192 || fallback192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: logo512 || fallback512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        "src": "/screenshots/home_wide.png",
        "sizes": "1280x720",
        "type": "image/png",
        "form_factor": "wide"
      },
      {
        "src": "/screenshots/home_mobile.png",
        "sizes": "640x1136",
        "type": "image/png",
        "form_factor": "narrow"
      }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "no-store",
    },
  });
}
