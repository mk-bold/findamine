'use client';

import React from 'react';
import CluesFindingsView from './CluesFindingsView';
import { ClueFindingsModalProps } from '../types/clue-findings';

export default function CluesFindingModal({
  isOpen,
  onClose,
  clueLocationId,
  gameId,
  clueName
}: ClueFindingsModalProps) {
  if (!isOpen) return null;

  return (
    <CluesFindingsView
      clueLocationId={clueLocationId}
      gameId={gameId}
      clueName={clueName}
      onClose={onClose}
    />
  );
}