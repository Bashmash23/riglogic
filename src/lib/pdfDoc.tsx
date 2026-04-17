"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  groupByCategory,
  groupByHouse,
  snapshotTotals,
  type KitSnapshot,
} from "./kitSnapshot";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111111",
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 10,
    marginBottom: 14,
  },
  brand: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  brandAccent: { color: "#E87722" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  metaItem: { fontSize: 9, color: "#555555" },
  projectTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  categoryBlock: { marginBottom: 10 },
  categoryHeader: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#E87722",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingBottom: 3,
    marginBottom: 3,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#666666",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eeeeee",
  },
  cellName: { flex: 4, paddingRight: 6 },
  cellQty: { flex: 1, textAlign: "right" },
  cellRate: { flex: 1.3, textAlign: "right" },
  cellTotal: { flex: 1.4, textAlign: "right", fontFamily: "Helvetica-Bold" },
  cellHouse: { flex: 2, color: "#666666", fontSize: 9 },
  name: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  subName: { color: "#888888", fontSize: 8, marginTop: 1 },
  totalsBlock: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#111111",
    paddingTop: 8,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  totalsLabel: { fontFamily: "Helvetica-Bold" },
  grandTotal: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
  housesSection: { marginTop: 16 },
  housesHeader: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  houseLine: { fontSize: 9, color: "#333333", marginBottom: 1 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 8,
    fontSize: 8,
    color: "#888888",
    textAlign: "center",
  },
});

export function KitPdfDocument({ snapshot }: { snapshot: KitSnapshot }) {
  const { perDay, days, lineTotal } = snapshotTotals(snapshot);
  const categories = groupByCategory(snapshot);
  const houses = groupByHouse(snapshot);

  const dateStr =
    snapshot.startDate && snapshot.endDate
      ? `${snapshot.startDate} → ${snapshot.endDate}`
      : "Dates not set";

  return (
    <Document
      title={`RigLogic — ${snapshot.projectName}`}
      author="RigLogic"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>
            Rig<Text style={styles.brandAccent}>Logic</Text>
          </Text>
          <Text style={styles.projectTitle}>{snapshot.projectName}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>{dateStr}</Text>
            <Text style={styles.metaItem}>
              {snapshot.createdByName || snapshot.createdByEmail
                ? `Prepared by ${
                    snapshot.createdByName ?? snapshot.createdByEmail
                  }`
                : ""}
            </Text>
          </View>
        </View>

        {categories.length === 0 ? (
          <Text>No items in this kit.</Text>
        ) : (
          categories.map((block) => (
            <View key={block.category} style={styles.categoryBlock} wrap={false}>
              <Text style={styles.categoryHeader}>{block.category}</Text>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, styles.cellName]}>Item</Text>
                <Text style={[styles.tableHeaderCell, styles.cellHouse]}>
                  Rental house
                </Text>
                <Text style={[styles.tableHeaderCell, styles.cellQty]}>Qty</Text>
                <Text style={[styles.tableHeaderCell, styles.cellRate]}>
                  Day rate
                </Text>
                <Text style={[styles.tableHeaderCell, styles.cellTotal]}>
                  {days > 0 ? `x ${days}d` : "Per day"}
                </Text>
              </View>
              {block.items.map((it) => {
                const lineAmount =
                  days > 0
                    ? it.quantity * it.dayRateAED * days
                    : it.quantity * it.dayRateAED;
                return (
                  <View key={it.lineId} style={styles.row} wrap={false}>
                    <View style={styles.cellName}>
                      <Text style={styles.name}>{it.name}</Text>
                      <Text style={styles.subName}>{it.blurb}</Text>
                    </View>
                    <Text style={styles.cellHouse}>
                      {it.house?.name ?? "—"}
                    </Text>
                    <Text style={styles.cellQty}>{it.quantity}</Text>
                    <Text style={styles.cellRate}>
                      AED {it.dayRateAED.toLocaleString()}
                    </Text>
                    <Text style={styles.cellTotal}>
                      AED {lineAmount.toLocaleString()}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))
        )}

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Per-day total</Text>
            <Text>AED {perDay.toLocaleString()}</Text>
          </View>
          {days > 0 && (
            <>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Rental days</Text>
                <Text>{days}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.grandTotal}>Kit total</Text>
                <Text style={styles.grandTotal}>
                  AED {lineTotal.toLocaleString()}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.housesSection}>
          <Text style={styles.housesHeader}>Rental houses to contact</Text>
          {houses.map((h) => (
            <Text key={h.houseId ?? h.houseName} style={styles.houseLine}>
              {h.houseName} — {h.items.length} item
              {h.items.length === 1 ? "" : "s"}
              {h.houseWebsite ? `  ·  ${h.houseWebsite}` : ""}
            </Text>
          ))}
        </View>

        <Text style={styles.footer} fixed>
          Indicative rates only. Confirm pricing with rental house. ·
          Generated {new Date(snapshot.createdAt).toLocaleDateString("en-GB")} ·
          riglogic.vercel.app
        </Text>
      </Page>
    </Document>
  );
}
