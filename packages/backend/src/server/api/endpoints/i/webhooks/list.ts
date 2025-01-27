import { Webhooks } from "@/models/index.js";
import define from "../../../define.js";

export const meta = {
    tags: ["webhooks", "account"],

    requireCredential: true,

    kind: "read:account",
} as const;

export const paramDef = {
    type: "object",
    properties: {},
    required: [],
} as const;

export default define(meta, paramDef, async (ps, me) => {
    const webhooks = await Webhooks.findBy({
        userId: me.id,
    });

    return webhooks;
});
