export type EntityType = 
  | "NAME"
  | "EMAIL"
  | "PHONE"
  | "ID_NUMBER"
  | "CREDIT_CARD"
  | "SECRET"
  | "IP_ADDRESS";

export type RedactionStyle = "tag" | "mask" | "hash" | "synthetic" | "remove";

export interface DetectedEntity {
  id: string;
  type: EntityType;
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: number; // 0.00 to 1.00
  redactedValue: string;
  enabled: boolean;
}

export interface RedactionConfig {
  style: RedactionStyle;
  customMaskChar?: string;
  confidenceThreshold: number; // 0 to 1
  enabledTypes: Record<EntityType, boolean>;
}

export const DEFAULT_CONFIG: RedactionConfig = {
  style: "tag",
  customMaskChar: "•",
  confidenceThreshold: 0.6,
  enabledTypes: {
    NAME: true,
    EMAIL: true,
    PHONE: true,
    ID_NUMBER: true,
    CREDIT_CARD: true,
    SECRET: true,
    IP_ADDRESS: true,
  },
};

// Synthetic replacements for synthetic redaction style
const SYNTHETIC_REPLACEMENTS: Record<EntityType, string[]> = {
  NAME: ["Alex Morgan", "Jordan Lee", "Samira Patel", "Taylor Chen", "Casey Rivera"],
  EMAIL: ["user.redacted@example.com", "contact.anon@privacy.org", "inquiry@domain.test"],
  PHONE: ["+1-555-0199", "+91-9876500000", "+44-20-7946-0912"],
  ID_NUMBER: ["ID-XXXX-9999", "PAN-XXXXX9999X", "AADHAAR-XXXX-XXXX-0000"],
  CREDIT_CARD: ["4111-XXXX-XXXX-1111", "5500-XXXX-XXXX-0004"],
  SECRET: ["[TOKEN_REDACTED]", "[KEY_SANITIZED]"],
  IP_ADDRESS: ["192.0.2.1", "198.51.100.1"],
};

// Simple deterministic hash for hash redaction style
function pseudoHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(6, "0").slice(0, 6);
  return `[#${hex}]`;
}

// Generate redacted replacement string based on style
export function getRedactedValue(
  entity: { type: EntityType; value: string },
  style: RedactionStyle,
  customChar = "•"
): string {
  switch (style) {
    case "tag":
      return `[${entity.type}]`;
    case "mask":
      return customChar.repeat(Math.min(Math.max(entity.value.length, 4), 12));
    case "hash":
      return pseudoHash(entity.value);
    case "synthetic": {
      const pool = SYNTHETIC_REPLACEMENTS[entity.type] || ["[REDACTED]"];
      // deterministic pick based on value length
      const idx = entity.value.length % pool.length;
      return pool[idx];
    }
    case "remove":
      return "";
    default:
      return `[${entity.type}]`;
  }
}

// Known common titles / honorifics that strongly signify names
const HONORIFICS = ["Dr\\.", "Mr\\.", "Mrs\\.", "Ms\\.", "Prof\\.", "Shri", "Smt\\."];
const HONORIFIC_REGEX = new RegExp(`\\b(?:${HONORIFICS.join("|")})\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){1,2})\\b`, "g");

// Context verbs and prepositions that precede names
// e.g. "Contact John Mehta at", "Spoke with Alice Wonder", "Candidate: John Mehta"
const CONTEXT_PREFIXES = [
  "[Cc]ontact", "[Mm]eet", "[Ee]mail", "[Ss]poke with", "[Aa]ssigned to",
  "[Cc]andidate", "[Cc]lient", "[Pp]atient", "[Uu]ser", "[Ee]mployee",
  "[Aa]ttn", "[Aa]gent", "[Cc]ust(?:omer)?", "[Nn]ame\\s*[:=-]"
];
const CONTEXT_NAME_REGEX = new RegExp(
  `\\b(?:${CONTEXT_PREFIXES.join("|")})\\s+([A-Z][a-z]{1,15}(?:\\s+[A-Z][a-z]{1,15}){1,2})\\b`,
  "g"
);

// General capitalized full name pattern (2 or 3 capitalized words)
const GENERAL_NAME_REGEX = /\b([A-Z][a-z]{2,15}\s+[A-Z][a-z]{2,15}(?:\s+[A-Z][a-z]{2,15})?)\b/g;

// List of non-name capitalized phrases to exclude
const FALSE_POSITIVE_NAMES = new Set([
  "United States", "New York", "San Francisco", "Terms Conditions",
  "Privacy Policy", "Next Step", "Customer Support", "Technical Support",
  "Service Agreement", "Problem Statement", "Sample Input", "Sample Output",
  "All Rights", "Rights Reserved", "Dear Customer", "Hello World",
  "North America", "South America", "East Coast", "West Coast",
  "High Priority", "Low Priority", "Medium Priority", "Sensitive Data",
  "Detection Engine", "Original Redacted", "Table Listing", "Working Demo",
  "Synthetic Dataset", "Failure Edge", "Detection Recall", "False Positive",
  "Monday Morning", "Tuesday Afternoon", "Friday Evening", "Sunday Night"
]);

export function detectSensitiveData(
  text: string,
  config: RedactionConfig = DEFAULT_CONFIG
): {
  entities: DetectedEntity[];
  redactedText: string;
  summaryReport: string;
  counts: Record<EntityType, number>;
} {
  if (!text || text.trim() === "") {
    return {
      entities: [],
      redactedText: "",
      summaryReport: "No data provided",
      counts: {
        NAME: 0,
        EMAIL: 0,
        PHONE: 0,
        ID_NUMBER: 0,
        CREDIT_CARD: 0,
        SECRET: 0,
        IP_ADDRESS: 0,
      },
    };
  }

  const rawMatches: Array<{
    type: EntityType;
    value: string;
    startIndex: number;
    endIndex: number;
    confidence: number;
  }> = [];

  // 1. EMAILS
  const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  let match: RegExpExecArray | null;
  while ((match = EMAIL_REGEX.exec(text)) !== null) {
    rawMatches.push({
      type: "EMAIL",
      value: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.98,
    });
  }

  // 2. PHONES (Indian, International, standard 10-digit, formatted)
  // Catches: 9876543210, +91 9876543210, +1 (555) 123-4567, 123-456-7890, +91-9876543210
  const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}\b/g;
  while ((match = PHONE_REGEX.exec(text)) !== null) {
    const cleanDigits = match[0].replace(/\D/g, "");
    // Check if it looks like a genuine phone number (7 to 13 digits, not a year like 2024 or zip code)
    if (cleanDigits.length >= 10 && cleanDigits.length <= 13) {
      // Avoid matching credit cards or 16-digit IDs here
      if (cleanDigits.length !== 16) {
        rawMatches.push({
          type: "PHONE",
          value: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          confidence: 0.95,
        });
      }
    }
  }

  // 3. CREDIT CARDS (16-digit cards with optional dashes/spaces)
  const CC_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
  while ((match = CC_REGEX.exec(text)) !== null) {
    const digits = match[0].replace(/\D/g, "");
    if (digits.length === 16) {
      rawMatches.push({
        type: "CREDIT_CARD",
        value: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.96,
      });
    }
  }

  // 4. ID NUMBERS (Aadhaar 12-digit, PAN Card, SSN, Passport)
  // PAN: 5 uppercase letters, 4 digits, 1 uppercase letter
  const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;
  while ((match = PAN_REGEX.exec(text)) !== null) {
    rawMatches.push({
      type: "ID_NUMBER",
      value: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.97,
    });
  }

  // SSN: 3-2-4 format
  const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;
  while ((match = SSN_REGEX.exec(text)) !== null) {
    rawMatches.push({
      type: "ID_NUMBER",
      value: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.96,
    });
  }

  // Aadhaar: 12-digit formatted as XXXX XXXX XXXX
  const AADHAAR_REGEX = /\b\d{4}\s\d{4}\s\d{4}\b/g;
  while ((match = AADHAAR_REGEX.exec(text)) !== null) {
    rawMatches.push({
      type: "ID_NUMBER",
      value: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.95,
    });
  }

  // 5. SECRETS & API KEYS
  const SECRET_REGEX = /\b(?:ghp_[a-zA-Z0-9]{36}|AKIA[0-9A-Z]{16}|sk-[a-zA-Z0-9]{32,}|bearer\s+[a-zA-Z0-9_\-\.]{20,}|(?:api[_-]?key|secret[_-]?token)[:=\s]+["']?([a-zA-Z0-9_\-]{16,})["']?)\b/gi;
  while ((match = SECRET_REGEX.exec(text)) !== null) {
    rawMatches.push({
      type: "SECRET",
      value: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.97,
    });
  }

  // 6. IP ADDRESSES (IPv4)
  const IP_REGEX = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  while ((match = IP_REGEX.exec(text)) !== null) {
    rawMatches.push({
      type: "IP_ADDRESS",
      value: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.91,
    });
  }

  // 7. NAMES (Contextual & General with false-positive filtering)
  // A. Context preceded names (e.g. "Contact John Mehta at")
  while ((match = CONTEXT_NAME_REGEX.exec(text)) !== null) {
    const nameVal = match[1];
    if (nameVal && !FALSE_POSITIVE_NAMES.has(nameVal)) {
      const nameStart = match.index + match[0].lastIndexOf(nameVal);
      rawMatches.push({
        type: "NAME",
        value: nameVal,
        startIndex: nameStart,
        endIndex: nameStart + nameVal.length,
        confidence: 0.95,
      });
    }
  }

  // B. Honorific preceded names (e.g. "Dr. John Mehta")
  while ((match = HONORIFIC_REGEX.exec(text)) !== null) {
    const nameVal = match[1];
    if (nameVal && !FALSE_POSITIVE_NAMES.has(nameVal)) {
      const nameStart = match.index + match[0].lastIndexOf(nameVal);
      rawMatches.push({
        type: "NAME",
        value: nameVal,
        startIndex: nameStart,
        endIndex: nameStart + nameVal.length,
        confidence: 0.94,
      });
    }
  }

  // List of words that should not be part of a person's name
  const DISALLOWED_FIRST_WORDS = new Set([
    "Contact", "Please", "Hello", "Dear", "Call", "Email", "Send", "Meet", "From",
    "To", "Subject", "Date", "Review", "Warning", "Alert", "Notice", "Summary",
    "Report", "Details", "Action", "Problem", "Statement", "Suggested", "Basic",
    "Handling", "Failures", "Edge", "Cases", "Data", "Considerations", "Solution"
  ]);

  // C. General full name regex (e.g. "John Mehta")
  while ((match = GENERAL_NAME_REGEX.exec(text)) !== null) {
    let nameCandidate = match[1];
    let startOffset = match.index;

    // Check if the first word is a verb/preposition like "Contact John Mehta"
    const words = nameCandidate.split(/\s+/);
    if (words.length > 2 && DISALLOWED_FIRST_WORDS.has(words[0])) {
      startOffset += words[0].length + 1;
      nameCandidate = words.slice(1).join(" ");
    }

    if (!FALSE_POSITIVE_NAMES.has(nameCandidate) && !DISALLOWED_FIRST_WORDS.has(words[0])) {
      rawMatches.push({
        type: "NAME",
        value: nameCandidate,
        startIndex: startOffset,
        endIndex: startOffset + nameCandidate.length,
        confidence: 0.82,
      });
    }
  }

  // Resolve overlapping spans: prioritize higher confidence, then longer span
  rawMatches.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    const lenA = a.endIndex - a.startIndex;
    const lenB = b.endIndex - b.startIndex;
    if (lenA !== lenB) return lenB - lenA;
    return a.startIndex - b.startIndex;
  });

  const nonOverlapping: typeof rawMatches = [];
  for (const m of rawMatches) {
    const overlaps = nonOverlapping.some(
      (existing) =>
        Math.max(existing.startIndex, m.startIndex) <
        Math.min(existing.endIndex, m.endIndex)
    );
    if (!overlaps) {
      nonOverlapping.push(m);
    }
  }

  // Filter by user configuration (enabled types & confidence threshold)
  const filteredMatches = nonOverlapping.filter((item) => {
    const isTypeEnabled = config.enabledTypes[item.type] !== false;
    const meetsThreshold = item.confidence >= config.confidenceThreshold;
    return isTypeEnabled && meetsThreshold;
  });

  filteredMatches.sort((a, b) => a.startIndex - b.startIndex);

  // Build entity list
  const entities: DetectedEntity[] = filteredMatches.map((m, idx) => ({
    id: `ent-${idx + 1}`,
    type: m.type,
    value: m.value,
    startIndex: m.startIndex,
    endIndex: m.endIndex,
    confidence: m.confidence,
    redactedValue: getRedactedValue(m, config.style, config.customMaskChar),
    enabled: true,
  }));

  // Build counts
  const counts: Record<EntityType, number> = {
    NAME: 0,
    EMAIL: 0,
    PHONE: 0,
    ID_NUMBER: 0,
    CREDIT_CARD: 0,
    SECRET: 0,
    IP_ADDRESS: 0,
  };

  entities.forEach((ent) => {
    counts[ent.type] = (counts[ent.type] || 0) + 1;
  });

  // Construct summary report string (e.g. "Report: 1 Name, 1 Email, 1 Phone detected")
  const typeDisplayNames: Record<EntityType, string> = {
    NAME: "Name",
    EMAIL: "Email",
    PHONE: "Phone",
    ID_NUMBER: "ID Number",
    CREDIT_CARD: "Credit Card",
    SECRET: "Secret",
    IP_ADDRESS: "IP Address",
  };

  const summaryParts = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => {
      const name = typeDisplayNames[type as EntityType];
      return `${count} ${name}${count > 1 ? "s" : ""}`;
    });

  const summaryReport =
    summaryParts.length > 0
      ? `Report: ${summaryParts.join(", ")} detected`
      : "No sensitive data found";

  // Build redacted text by splicing from back to front
  let redactedText = text;
  const reversedEntities = [...entities].reverse();
  for (const ent of reversedEntities) {
    if (ent.enabled) {
      redactedText =
        redactedText.substring(0, ent.startIndex) +
        ent.redactedValue +
        redactedText.substring(ent.endIndex);
    }
  }

  return {
    entities,
    redactedText,
    summaryReport,
    counts,
  };
}
