export interface CalendarResponse {
  competition: string;
  season: string;
  matches: Match[];
}

export interface Match {
  stage: string;
  matchday: number | string;
  date: string;
  opponent: string;
  is_home: boolean;
  time: string;
  field: string;
}

export interface LastMatch {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  isBye: boolean;
}

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

export enum Stage {
  PrimeraVuelta = 'Primera Vuelta',
  SegundaVuelta = 'Segunda Vuelta'
}
