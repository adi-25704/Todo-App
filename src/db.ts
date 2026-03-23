import Dexie, {type EntityTable} from "dexie";
import type { AppItem } from "./types";

const db = new Dexie("TaskManager") as Dexie & {
    items: EntityTable<AppItem, "id">
    categories: EntityTable<{ name: string }, 'name'>;
}

db.version(2).stores(
    {
        items:"id, type, status, dueDate, category, title",
        categories: 'name'
    }
);

export {db};