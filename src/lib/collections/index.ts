import { cities } from "./cities";
import { dishes } from "./dishes";
import { footballClubs } from "./football-clubs";
import { sports } from "./sports";
import { websites } from "./websites";
import type { Collection } from "../types";

/**
 * Collections the switcher can pick between. Each one is a single data file
 * under this directory — items, factors, the prompt template, and seed
 * scores all live together, so adding a category never touches UI code.
 */
export const COLLECTIONS: Collection[] = [cities, dishes, sports, websites, footballClubs];

export type { Collection };
