"use client";

import { COLLECTIONS } from "@/lib/collections";
import { useRanking } from "@/hooks/use-ranking";
import { Sidebar } from "@/components/sidebar";
import { RankingTable } from "@/components/ranking-table";

export default function Home() {
  const {
    collectionId,
    setCollectionId,
    noun,
    factors,
    addFactor,
    editFactor,
    removeFactor,
    setWeight,
    addItem,
    removeItem,
    retryCell,
    rows,
  } = useRanking();

  const scoredCount = rows.filter((r) => r.rowStatus === "ready").length;
  const errorCount = rows.filter((r) => r.rowStatus === "error" || r.rowStatus === "partial").length;

  return (
    <main className="grid h-screen grid-cols-1 overflow-hidden bg-white text-neutral-900 sm:grid-cols-[minmax(260px,1fr)_2fr]">
      <Sidebar
        collections={COLLECTIONS}
        collectionId={collectionId}
        onCollectionChange={setCollectionId}
        noun={noun}
        factors={factors}
        onAddFactor={addFactor}
        onEditFactor={editFactor}
        onSetWeight={setWeight}
        onRemoveFactor={removeFactor}
        scoredCount={scoredCount}
        totalCount={rows.length}
        errorCount={errorCount}
      />
      <RankingTable
        rows={rows}
        factors={factors}
        noun={noun}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onRetry={retryCell}
      />
    </main>
  );
}
