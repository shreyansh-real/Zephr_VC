import { z } from "zod";

const CATEGORIES = ["Water", "Lift", "Parking", "Cleaning", "Security", "Noise", "Other"] as const;
type Category = (typeof CATEGORIES)[number];

const URGENCIES = ["Critical", "High", "Medium", "Low"] as const;
type Urgency = (typeof URGENCIES)[number];

interface OpenCluster {
  id: string;
  title: string;
  category: string;
  urgency: string;
  count: number;
}

export function extractWingOrLocation(flatNo: string, text: string): string | null {
  const combined = `${flatNo} ${text}`.toUpperCase();
  
  // Check flat prefix e.g. "C-220", "C220", "C 220", "WING C", "BLOCK C", "TOWER C"
  const wingMatch = combined.match(/\b([A-Z])[- ]?(\d{2,4})\b/) || combined.match(/\b(WING|BLOCK|TOWER|BUILDING)\s*([A-Z0-9]+)\b/) || combined.match(/\b([A-Z])\s*(WING|BLOCK|TOWER)\b/);
  if (wingMatch) {
    if (wingMatch[1] && wingMatch[1].length === 1 && /[A-Z]/.test(wingMatch[1])) {
      return wingMatch[1]; // e.g. "C"
    }
    if (wingMatch[2] && wingMatch[2].length <= 3) {
      return wingMatch[2]; // e.g. "C"
    }
  }

  // Location keywords
  if (/BASEMENT|B1|B2|PARKING/.test(combined)) return "Basement";
  if (/CLUBHOUSE|GYM|POOL/.test(combined)) return "Clubhouse";
  if (/GATE\s*1|MAIN\s*GATE/.test(combined)) return "Gate 1";
  if (/GATE\s*2/.test(combined)) return "Gate 2";

  return null;
}

export function inferCategoryFromText(text: string): Category {
  const t = text.toLowerCase();
  if (/water|pani|paani|tap|dry|nal|pressure|motor|pipeline|leak|tank|tanki|supply/.test(t)) return "Water";
  if (/lift|elevator|stuck|floor|ground|atak|elevator/.test(t)) return "Lift";
  if (/park|parking|slot|car|gaadi|gadi|vehicle|bike|scooter|encroach|blocked/.test(t)) return "Parking";
  if (/garbage|kachra|clean|safai|dirty|smell|trash|dustbin|corridor/.test(t)) return "Cleaning";
  if (/security|guard|gate|theft|cctv|stranger|thief|entry|visitor/.test(t)) return "Security";
  if (/noise|shor|music|loud|sound|party|barking|dog/.test(t)) return "Noise";
  return "Other";
}

export function findMatchingCluster(
  flatNo: string,
  rawText: string,
  category: Category,
  openClusters: OpenCluster[]
): OpenCluster | null {
  if (openClusters.length === 0) return null;

  const wing = extractWingOrLocation(flatNo, rawText);
  const textLower = rawText.toLowerCase();

  // 1. Exact Category + Wing Match (Highest Confidence)
  if (wing) {
    const wingCluster = openClusters.find((c) => {
      if (c.category.toLowerCase() !== category.toLowerCase()) return false;
      const cTitle = c.title.toUpperCase();
      return (
        cTitle.includes(`WING ${wing}`) ||
        cTitle.includes(`BLOCK ${wing}`) ||
        cTitle.includes(`TOWER ${wing}`) ||
        cTitle.includes(`${wing}-`) ||
        cTitle.includes(`${wing} `) ||
        cTitle.includes(` ${wing} `) ||
        cTitle.endsWith(` ${wing}`)
      );
    });
    if (wingCluster) return wingCluster;
  }

  // 2. Same Category + specific keyword overlap
  const sameCatClusters = openClusters.filter(
    (c) => c.category.toLowerCase() === category.toLowerCase()
  );

  if (sameCatClusters.length === 1) {
    // If there is only ONE open issue for this category (e.g. Lift breakdown), group into it
    return sameCatClusters[0]!;
  }

  for (const c of sameCatClusters) {
    const titleWords = c.title.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const matches = titleWords.filter((w) => textLower.includes(w));
    if (matches.length >= 2) {
      return c;
    }
  }

  return null;
}
