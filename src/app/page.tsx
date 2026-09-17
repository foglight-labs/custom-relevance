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
      <div className="relative z-50 flex h-[52px] items-center border-b border-hairline bg-page px-8">
        <CollectionSwitcher
          collections={COLLECTIONS}
          collectionId={collectionId}
          onCollectionChange={setCollectionId}
        />
      </div>

      <FactorStrip
        factors={factors}
        onAddFactor={addFactor}
        onEditFactor={editFactor}
        onSetWeight={setWeight}
        onRemoveFactor={removeFactor}
      />

      <RankingTable
        rows={rows}
        factors={factors}
        noun={noun}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onRetry={retryCell}
      />
    </>
  );
}
