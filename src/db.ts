import Dexie, {type EntityTable} from "dexie";
import type { AppItem } from "./types";

const db = new Dexie("TaskManager") as Dexie & {
    items: EntityTable<AppItem, "id">
    categories: EntityTable<{ name: string }, 'name'>;
}

db.version(4).stores(
    {
        items:"id, type, taskStatus, dueDate, category, title, nextBillingDate, prevBillingDate",
        categories: 'name'
    }
);

export {db};