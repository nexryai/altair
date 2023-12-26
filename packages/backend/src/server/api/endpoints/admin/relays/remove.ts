import { removeRelay } from "@/services/relay.js";
import define from "../../../define.js";

export const meta = {
    tags: ["admin"],

    kind: "write:admin",

    requireCredential: true,
    requireModerator: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        inbox: { type: "string" },
    },
    required: ["inbox"],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
    return await removeRelay(ps.inbox);
});
