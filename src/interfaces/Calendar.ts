export interface CalendarResponse {
  competition: string;
  season: string;
  matches: Match[];
}

export interface Match {
  stage: string;
  matchday: number;
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

export enum Stage {
  PrimeraVuelta = 'Primera Vuelta',
  SegundaVuelta = 'Segunda Vuelta'
}
