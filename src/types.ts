export interface FilmIdentity {
  title: string;
  genre: string;
  style: string;
  thematicIntersection: string; // How it blends Love, Homeland, Death
  impactAndHumor: string;
}

export interface Character {
  name: string;
  role: string;
  psychology: string;
  conflict: string;
}

export interface ScriptArchitecture {
  act1: string;
  act2: string;
  act3: string;
  characters: Character[];
  creationQuestions: string[];
}

export interface ColorSwatch {
  hex: string;
  emotion: string;
  scene: string;
}

export interface VisualLanguage {
  colorPaletteDescription: string;
  colors: ColorSwatch[];
  cameraAngles: string;
  shootingFeel: string;
}

export interface LocationDesign {
  atmosphere: string;
  symbolicObjects: string;
}

export interface CostumeDesign {
  fabricAndCuts: string;
  periodReferences: string;
}

export interface ArtDirection {
  locations: LocationDesign;
  costumes: CostumeDesign;
}

export interface AuditoryWorld {
  musicUsage: string;
  musicMovementSync: string;
  soundDesign: string; // Ambient, wind, silence
}

export interface DirectorRoadmap {
  actorDirection: string;
  editingRecommendations: string;
  technicalDevelopment: string[]; // 3 subjects
  actionPlan: string[]; // 5 steps
}

export interface FilmProductionGuide {
  id: string;
  idea: string;
  title: string;
  createdAt: string;
  focusTheme: string; // Blend of Love, Homeland, Death
  identity: FilmIdentity;
  script: ScriptArchitecture;
  visuals: VisualLanguage;
  art: ArtDirection;
  auditory: AuditoryWorld;
  roadmap: DirectorRoadmap;
  htmlReport: string; // A beautiful responsive self-contained copyable HTML/CSS code
}
