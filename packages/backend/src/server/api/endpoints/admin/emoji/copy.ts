import { IsNull } from "typeorm";
import { Emojis } from "@/models/index.js";
import { genId } from "@/misc/gen-id.js";
import { DriveFile } from "@/models/entities/drive-file.js";
import { uploadFromUrl } from "@/services/drive/upload-from-url.js";
import { publishBroadcastStream } from "@/services/stream.js";
import { db } from "@/db/postgre.js";
import { ApiError } from "../../../error.js";
import define from "../../../define.js";

export const meta = {
    tags: ["admin"],

    requireCredential: true,
    requireModerator: true,

    errors: {
        noSuchEmoji: {
            message: "No such emoji.",
            code: "NO_SUCH_EMOJI",
            id: "e2785b66-dca3-4087-9cac-b93c541cc425",
        },
        duplicateName: {
            message: "Duplicate name.",
            code: "DUPLICATE_NAME",
            id: "f7a3462c-4e6e-4069-8421-b9bd4f4c3975",
        },
    },

    res: {
        type: "object",
        optional: false, nullable: false,
        properties: {
            id: {
                type: "string",
                optional: false, nullable: false,
                format: "id",
            },
        },
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {
        emojiId: { type: "string", format: "misskey:id" },
    },
    required: ["emojiId"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
    const emoji = await Emojis.findOneBy({ id: ps.emojiId });

    if (emoji == null) {
        throw new ApiError(meta.errors.noSuchEmoji);
    }

    const existemojis = await Emojis.findOneBy({
        host: IsNull(),
        name: emoji.name,
    });

    if (existemojis != null) {
        throw new ApiError(meta.errors.duplicateName);
    }

    let driveFile: DriveFile;

    try {
        // Create file
        driveFile = await uploadFromUrl({ url: emoji.originalUrl, user: null, force: true });
    } catch (e) {
        throw new ApiError();
    }

    const copied = await Emojis.insert({
        id: genId(),
        updatedAt: new Date(),
        name: emoji.name,
        host: null,
        aliases: [],
        originalUrl: driveFile.url,
        publicUrl: driveFile.webpublicUrl ?? driveFile.url,
        type: driveFile.webpublicType ?? driveFile.type,
    }).then(x => Emojis.findOneByOrFail(x.identifiers[0]));

    await db.queryResultCache!.remove(["meta_emojis"]);

    publishBroadcastStream("emojiAdded", {
        emoji: await Emojis.pack(copied.id),
    });

    return {
        id: copied.id,
    };
});
