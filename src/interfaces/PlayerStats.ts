export interface PlayerStats {
  position: number;
  player: string;
  team: string;
  group: string;
  matches_played: number;
  goals: {
    total: number;
    details: string;
    penalties: number;
  };
  goals_per_match: number;
}
