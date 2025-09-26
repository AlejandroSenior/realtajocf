export interface CalendarResponse {
  competition: string;
  season: string;
  matches: Match[];
}

export interface Match {
  stage: Stage;
  matchday: number;
  date: Date;
  opponent: string;
  is_home: boolean;
}

export enum Stage {
  PrimeraVuelta = 'Primera Vuelta',
  SegundaVuelta = 'Segunda Vuelta'
}
