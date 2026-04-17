// Compose a `mailto:` URL per rental house with the items for that house,
// shoot dates, and a short polite inquiry line.

import {
  groupByHouse,
  snapshotTotals,
  type KitSnapshot,
} from "./kitSnapshot";

interface MailtoDraft {
  houseId: string | null;
  houseName: string;
  mailto: string;
  itemCount: number;
}

export function mailtoForHouse(
  snap: KitSnapshot,
  houseId: string,
  recipientEmail?: string,
): string | null {
  const houses = groupByHouse(snap);
  const house = houses.find((h) => h.houseId === houseId);
  if (!house) return null;
  return buildMailto(snap, house, recipientEmail);
}

export function allHouseMailtos(
  snap: KitSnapshot,
  recipientMap: Record<string, string> = {},
): MailtoDraft[] {
  return groupByHouse(snap).map((house) => ({
    houseId: house.houseId,
    houseName: house.houseName,
    itemCount: house.items.length,
    mailto: buildMailto(
      snap,
      house,
      house.houseId ? recipientMap[house.houseId] : undefined,
    ),
  }));
}

function buildMailto(
  snap: KitSnapshot,
  house: ReturnType<typeof groupByHouse>[number],
  recipientEmail?: string,
): string {
  const { days } = snapshotTotals(snap);
  const dateFragment =
    snap.startDate && snap.endDate
      ? `${snap.startDate} → ${snap.endDate}`
      : "Dates TBC";

  const subject = `Rental inquiry — ${dateFragment} — ${house.items.length} item${
    house.items.length === 1 ? "" : "s"
  }`;

  const lines: string[] = [];
  lines.push(`Hi ${house.houseName},`);
  lines.push("");
  lines.push(
    `I'm prepping ${snap.projectName || "an upcoming shoot"} and would like to confirm availability and final pricing for the following items:`,
  );
  lines.push("");
  for (const it of house.items) {
    lines.push(`• ${it.quantity} × ${it.name}`);
  }
  lines.push("");
  lines.push(`Shoot dates: ${dateFragment}${days > 0 ? ` (${days} day${days === 1 ? "" : "s"})` : ""}`);
  lines.push("");
  lines.push("Could you confirm availability and send a quote?");
  lines.push("Thank you.");
  if (snap.createdByName) {
    lines.push("");
    lines.push(snap.createdByName);
  }

  const body = lines.join("\n");

  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", body);

  const to = recipientEmail ?? "";
  // Note: URLSearchParams encodes spaces as `+`; mailto clients prefer %20.
  const queryString = params.toString().replace(/\+/g, "%20");
  return `mailto:${to}?${queryString}`;
}
