import Dexie, {type EntityTable} from "dexie";
import type { AppItem } from "./types";

const db = new Dexie("TaskManager") as Dexie & {
    items: EntityTable<AppItem, "id">
    categories: EntityTable<{ name: string }, 'name'>;
}

db.on('populate', () => {
    return db.categories.bulkAdd([
    { name: "Entertainment" },
    { name: "Cloud & Infrastructure" },
    { name: "Software & Tools" },
    {name: "Utilities"},
    {name: "Academic"},
    {name: "Personal"},
    {name: "Finance"}
  ]);
});

db.version(6).stores(
    {
        items:"id, type, taskStatus, dueDate, category, title, nextBillingDate, prevBillingDate",
        categories: 'name'
    }
)

export {db};



