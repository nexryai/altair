import { publishMainStream } from "@/services/stream.js";
import { NoteUnreads } from "@/models/index.js";
import define from "../../define.js";

export const meta = {
    tags: ["account"],

    requireCredential: true,

    kind: "write:account",
} as const;

export const paramDef = {
    type: "object",
    properties: {},
    required: [],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    // Remove documents
    await NoteUnreads.delete({
        userId: user.id,
    });

    // 全て既読になったイベントを発行
    publishMainStream(user.id, "readAllUnreadMentions");
    publishMainStream(user.id, "readAllUnreadSpecifiedNotes");
});
