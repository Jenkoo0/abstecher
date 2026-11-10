export type HairStyle =
  | "hood"
  | "beanie"
  | "mohawk"
  | "cap"
  | "bald"
  | "slick"
  | "dreads"
  | "bun";

export type Skin = {
  id: string;
  name: string;
  line: string;
  coat: string;
  trim: string;
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  pants: string;
  knife: string;
  bulk: number;
  shades: boolean;
  vest: string | null;
};

export const SKINS: Skin[] = [
  {
    id: "kalle",
    name: "Kalle",
    line: "Hoodie, bunte Flicken",
    coat: "#3a4660",
    trim: "#e10600",
    skin: "#e4b898",
    hair: "#c44ad4",
    hairStyle: "hood",
    pants: "#242833",
    knife: "#d7dde3",
    bulk: 0.92,
    shades: false,
    vest: null,
  },
  {
    id: "miri",
    name: "Miri",
    line: "Langer Mantel, Silberhaar",
    coat: "#14161c",
    trim: "#9aa8b8",
    skin: "#c68662",
    hair: "#d5dde6",
    hairStyle: "slick",
    pants: "#101216",
    knife: "#c9d2da",
    bulk: 1.06,
    shades: false,
    vest: null,
  },
  {
    id: "reno",
    name: "Reno",
    line: "Leder und roter Iro",
    coat: "#1a120f",
    trim: "#e10600",
    skin: "#f0c8a4",
    hair: "#e10600",
    hairStyle: "mohawk",
    pants: "#121010",
    knife: "#f3efe6",
    bulk: 1,
    shades: false,
    vest: null,
  },
  {
    id: "pepe",
    name: "Pepe",
    line: "Puffer, Beanie, Brille",
    coat: "#e07a3d",
    trim: "#6a3414",
    skin: "#8d552f",
    hair: "#1a120e",
    hairStyle: "beanie",
    pants: "#2a241c",
    knife: "#e8eef2",
    bulk: 1.02,
    shades: true,
    vest: null,
  },
  {
    id: "aylin",
    name: "Aylin",
    line: "Warnweste, breit",
    coat: "#1c2430",
    trim: "#f5c518",
    skin: "#d9a27a",
    hair: "#3a2418",
    hairStyle: "bun",
    pants: "#1c2430",
    knife: "#d5dde4",
    bulk: 1.14,
    shades: false,
    vest: "#f5c518",
  },
  {
    id: "boris",
    name: "Boris",
    line: "Glatze, Leder, Kette",
    coat: "#161616",
    trim: "#c9a227",
    skin: "#f0d0b4",
    hair: "#c4a484",
    hairStyle: "bald",
    pants: "#1a1816",
    knife: "#ece7df",
    bulk: 1.22,
    shades: false,
    vest: null,
  },
  {
    id: "nici",
    name: "Nici",
    line: "Trench und dunkle Brille",
    coat: "#4a3b32",
    trim: "#1c140f",
    skin: "#a86b42",
    hair: "#1c140f",
    hairStyle: "slick",
    pants: "#2a221c",
    knife: "#d8cfc4",
    bulk: 1.02,
    shades: true,
    vest: null,
  },
  {
    id: "jule",
    name: "Jule",
    line: "Bomber und grelle Sneaker",
    coat: "#b4233a",
    trim: "#f5c518",
    skin: "#6b3e2a",
    hair: "#24160f",
    hairStyle: "dreads",
    pants: "#1a1c22",
    knife: "#dfe6ea",
    bulk: 0.88,
    shades: false,
    vest: null,
  },
];

export function skinById(id: string): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}
