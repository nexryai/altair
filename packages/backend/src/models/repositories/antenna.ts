import { db } from "@/db/postgre.js";
import { Antenna } from "@/models/entities/antenna.js";
import { Packed } from "@/misc/schema.js";
import { AntennaNotes } from "../index.js";

export const AntennaRepository = db.getRepository(Antenna).extend({
    async pack(
        src: Antenna["id"] | Antenna,
    ): Promise<Packed<"Antenna">> {
        const antenna = typeof src === "object" ? src : await this.findOneByOrFail({ id: src });

        const hasUnreadNote = (await AntennaNotes.findOneBy({ antennaId: antenna.id, read: false })) != null;

        return {
            id: antenna.id,
            createdAt: antenna.createdAt.toISOString(),
            name: antenna.name,
            keywords: antenna.keywords,
            excludeKeywords: antenna.excludeKeywords,
            src: antenna.src,
            userListId: antenna.userListId,
            users: antenna.users,
            caseSensitive: antenna.caseSensitive,
            notify: antenna.notify,
            withReplies: antenna.withReplies,
            withFile: antenna.withFile,
            hasUnreadNote,
        };
    },
});
