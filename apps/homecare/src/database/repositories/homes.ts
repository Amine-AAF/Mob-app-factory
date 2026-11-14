import type { SqlDatabase } from '@factory/storage';

import { newId } from '@/domain/ids';
import type { Home, HomeType, Room, RoomKind } from '@/domain/types';

import { createTable } from '../table';

export interface HomeInput {
  name: string;
  type: HomeType;
  areaM2?: number | null;
  roomsCount?: number | null;
  address?: string | null;
  moveInDate?: string | null;
  description?: string | null;
  currency: string;
  monthlyBudgetMinor?: number | null;
}

export function createHomesRepository(db: SqlDatabase, now: () => Date) {
  const homes = createTable<Home>(db, 'homes');
  const rooms = createTable<Room>(db, 'rooms');
  const stamp = () => now().toISOString();

  return {
    list: () => homes.select(undefined, [], 'created_at ASC'),
    get: (id: string) => homes.get(id),
    count: () => homes.count(),

    /** Creates a home and, optionally, its first spaces, atomically. */
    async create(input: HomeInput, initialRooms: { name: string; kind: RoomKind }[] = []): Promise<Home> {
      const id = newId('h_');
      const ts = stamp();
      await db.withTransactionAsync(async () => {
        await homes.insert({ id, ...input, name: input.name.trim(), createdAt: ts, updatedAt: ts });
        let position = 0;
        for (const r of initialRooms) {
          await rooms.insert({ id: newId('r_'), homeId: id, name: r.name, kind: r.kind, position: position++, createdAt: ts, updatedAt: ts });
        }
      });
      return (await homes.get(id)) as Home;
    },

    async update(id: string, patch: Partial<HomeInput>): Promise<void> {
      await homes.update(id, { ...patch, updatedAt: stamp() });
    },

    /** Deletes the home and (via ON DELETE CASCADE) everything attached to it. */
    async remove(id: string): Promise<void> {
      await homes.delete(id);
    },

    /* Rooms ------------------------------------------------------------- */

    listRooms: (homeId: string) => rooms.select('home_id = ?', [homeId], 'position ASC, name ASC'),
    getRoom: (id: string) => rooms.get(id),

    async createRoom(homeId: string, input: { name: string; kind: RoomKind; notes?: string | null }): Promise<Room> {
      const id = newId('r_');
      const ts = stamp();
      const max = await db.getFirstAsync<{ p: number | null }>('SELECT MAX(position) AS p FROM rooms WHERE home_id = ?', [homeId]);
      await rooms.insert({ id, homeId, name: input.name.trim(), kind: input.kind, notes: input.notes ?? null, position: (max?.p ?? -1) + 1, createdAt: ts, updatedAt: ts });
      return (await rooms.get(id)) as Room;
    },

    async updateRoom(id: string, patch: Partial<Pick<Room, 'name' | 'kind' | 'notes' | 'position'>>): Promise<void> {
      await rooms.update(id, { ...patch, updatedAt: stamp() });
    },

    /** Items in the room are kept and become "no room" (ON DELETE SET NULL). */
    removeRoom: (id: string) => rooms.delete(id),

    /** Number of assets, tasks, documents and inventory items per room, for the room list. */
    async roomCounts(homeId: string): Promise<Record<string, { assets: number; documents: number; tasks: number; inventory: number }>> {
      const rows = await db.getAllAsync<{ id: string; assets: number; documents: number; tasks: number; inventory: number }>(
        `SELECT r.id,
           (SELECT COUNT(*) FROM assets a WHERE a.room_id = r.id) AS assets,
           (SELECT COUNT(*) FROM documents d WHERE d.room_id = r.id) AS documents,
           (SELECT COUNT(*) FROM maintenance_tasks m WHERE m.room_id = r.id AND m.active = 1)
             + (SELECT COUNT(*) FROM household_tasks h WHERE h.room_id = r.id AND h.completed_at IS NULL) AS tasks,
           (SELECT COUNT(*) FROM inventory_items i WHERE i.room_id = r.id) AS inventory
         FROM rooms r WHERE r.home_id = ?`,
        [homeId],
      );
      return Object.fromEntries(rows.map(({ id, ...c }) => [id, c]));
    },
  };
}

export type HomesRepository = ReturnType<typeof createHomesRepository>;
