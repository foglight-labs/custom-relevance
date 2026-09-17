"use client";

import { COLLECTIONS } from "@/lib/collections";
import { useRanking } from "@/hooks/use-ranking";
import { CollectionSwitcher } from "@/components/collection-switcher";
import { FactorStrip } from "@/components/factor-strip";
import { RankingTable } from "@/components/ranking-table";

export default function Home() {
  const {
    collectionId,
    setCollectionId,
    noun,
    maxItems,
    maxFactors,
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

  return (
    <>
      <div className="relative z-50 flex min-h-[52px] items-center border-b border-hairline bg-page px-4 py-2 sm:px-8">
        <CollectionSwitcher
          collections={COLLECTIONS}
          collectionId={collectionId}
          onCollectionChange={setCollectionId}
        />
      </div>

      <FactorStrip
        factors={factors}
        maxFactors={maxFactors}
        onAddFactor={addFactor}
        onEditFactor={editFactor}
        onSetWeight={setWeight}
        onRemoveFactor={removeFactor}
      />

      <RankingTable
        rows={rows}
        factors={factors}
        noun={noun}
        maxItems={maxItems}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onRetry={retryCell}
      />
    </>
  );
}
