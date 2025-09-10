// Clue Findings related types

export interface ClueLocation {
  id: string;
  identifyingName: string;
  anonymizedName: string;
  latitude: number;
  longitude: number;
  text: string;
  hint?: string;
}

export interface GameInfo {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
}

export interface UserInfo {
  id: string;
  gamerTag?: string;
  firstName?: string;
  lastName?: string;
}

export interface GameClueInfo {
  id: string;
  customText?: string;
  customHint?: string;
  points: number;
  game: GameInfo;
  clueLocation: ClueLocation;
}

export interface ClueFindingWithDetails {
  id: string;
  foundAt: string;
  gpsLatitude: number;
  gpsLongitude: number;
  selfiePhoto?: string;
  points: number;
  shareFind: boolean;
  sharePhoto: boolean;
  address?: string;
  user: UserInfo;
  gameClue: GameClueInfo;
}

export interface ClueInfo {
  id: string;
  identifyingName: string;
  anonymizedName: string;
  text: string;
  hint?: string;
  latitude: number;
  longitude: number;
}

export interface ClueFindingsResponse {
  currentGameFindings: ClueFindingWithDetails[];
  allGamesFindings: ClueFindingWithDetails[];
  clueInfo: ClueInfo;
  totalCurrentGame: number;
  totalAllGames: number;
}

export interface ClueFindingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clueLocationId: string;
  gameId: string;
  clueName: string;
}

export interface ClueFindingsViewProps {
  clueLocationId: string;
  gameId: string;
  clueName: string;
  onClose: () => void;
}