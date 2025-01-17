import { CacheableRemoteUser } from "@/models/entities/user.js";
import deleteNode from "@/services/note/delete.js";
import { getApLock } from "@/misc/app-lock.js";
import { apLogger } from "../../logger.js";
import DbResolver from "../../db-resolver.js";

const logger = apLogger;

export default async function(actor: CacheableRemoteUser, uri: string): Promise<string> {
    logger.info(`Deleting the Note: ${uri}`);

    const unlock = await getApLock(uri);

    try {
        const dbResolver = new DbResolver();
        const note = await dbResolver.getNoteFromApId(uri);

        if (note == null) {
            return "指定されたNoteが見つかりません";
        }

        if (note.userId !== actor.id) {
            return "投稿を削除しようとしているユーザーは投稿の作成者ではありません";
        }

        await deleteNode(actor, note);
        return "ok: note deleted";
    } finally {
        unlock();
    }
}
