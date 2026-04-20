export type ModelDef = {
  name: string;
  path: string;
};

export const MODELS: ModelDef[] = [
  { name: "Castores", path: "/models/animal-beaver.glb" },
  { name: "Abejas", path: "/models/animal-bee.glb" },
  { name: "Conejos", path: "/models/animal-bunny.glb" },
  { name: "Gatos", path: "/models/animal-cat.glb" },
  { name: "Orugas", path: "/models/animal-caterpillar.glb" },
  { name: "Pollitos", path: "/models/animal-chick.glb" },
  { name: "Vacas", path: "/models/animal-cow.glb" },
  { name: "Cangrejos", path: "/models/animal-crab.glb" },
  { name: "Ciervos", path: "/models/animal-deer.glb" },
  { name: "Perros", path: "/models/animal-dog.glb" },
  { name: "Elefantes", path: "/models/animal-elephant.glb" },
  { name: "Peces", path: "/models/animal-fish.glb" },
  { name: "Zorros", path: "/models/animal-fox.glb" },
  { name: "Jirafas", path: "/models/animal-giraffe.glb" },
  { name: "Cerditos", path: "/models/animal-hog.glb" },
  { name: "Koalas", path: "/models/animal-koala.glb" },
  { name: "Leones", path: "/models/animal-lion.glb" },
  { name: "Monos", path: "/models/animal-monkey.glb" },
  { name: "Pandas", path: "/models/animal-panda.glb" },
  { name: "Loros", path: "/models/animal-parrot.glb" },
  { name: "Pingüinos", path: "/models/animal-penguin.glb" },
  { name: "Cerdos", path: "/models/animal-pig.glb" },
  { name: "Osos Polares", path: "/models/animal-polar.glb" },
  { name: "Tigres", path: "/models/animal-tiger.glb" },
];

export const getModelDef = (path: string): ModelDef | undefined =>
  MODELS.find((m) => m.path === path);

export const ANIMATION_NAMES = [
  "static",
  "idle",
  "walk",
  "run",
  "eat",
  "dance",
  "gesture-positive",
  "gesture-negative",
] as const;

export const BOARD_SIZE = 6 as const;
export const CELL_SIZE = 1.0 as const;
export const GAP = 0.08 as const;
export const BOARD_MARGIN = 0.3 as const;
export const STRIDE = CELL_SIZE + GAP;

export const DIRECTIONS = [
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 1, dy: 1 },
  { dx: 1, dy: -1 },
] as const;

export const PIECE_SCALE = {
  small: 0.5,
  large: 0.9,
} as const;

export const PIECE_HEIGHT_OFFSET = 0.05 as const;

export const toWorldPosition = (
  x: number,
  y: number,
): [number, number, number] => [
  (x - (BOARD_SIZE - 1) / 2) * STRIDE,
  0,
  (y - (BOARD_SIZE - 1) / 2) * STRIDE,
];
