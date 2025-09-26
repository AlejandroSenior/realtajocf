export interface ClassificationResponse {
  teams: Team[];
}

export interface Team {
  position: number;
  team: string;
  points: number;
  matches: Matches;
  goals: Goals;
  recent_form: RecentForm;
  sanction: RecentForm;
  raw: string;
}

export interface Goals {
  for: number;
  against: number;
}

export interface Matches {
  played: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface RecentForm {
  points: number;
}
