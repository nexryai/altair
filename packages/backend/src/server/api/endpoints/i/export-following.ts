import ms from "ms";
import { createExportFollowingJob } from "@/queue/index.js";
import define from "../../define.js";

export const meta = {
    secure: true,
    requireCredential: true,
    limit: {
        duration: ms("1hour"),
        max: 1,
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {
        excludeMuting: { type: "boolean", default: false },
        excludeInactive: { type: "boolean", default: false },
    },
    required: [],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    createExportFollowingJob(user, ps.excludeMuting, ps.excludeInactive);
});
