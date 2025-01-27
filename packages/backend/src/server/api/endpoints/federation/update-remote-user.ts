import { updatePerson } from "@/remote/activitypub/models/person.js";
import define from "../../define.js";
import { getRemoteUser } from "../../common/getters.js";

export const meta = {
    tags: ["federation"],

    requireCredential: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        userId: { type: "string", format: "misskey:id" },
    },
    required: ["userId"],
} as const;

export default define(meta, paramDef, async (ps) => {
    const user = await getRemoteUser(ps.userId);
    await updatePerson(user.uri!);
});
