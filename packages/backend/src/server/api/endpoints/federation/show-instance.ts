import { Instances } from "@/models/index.js";
import { toPuny } from "@/misc/convert-host.js";
import define from "../../define.js";

export const meta = {
    tags: ["federation"],

    requireCredential: true,

    res: {
        oneOf: [{
            type: "object",
            ref: "FederationInstance",
        }, {
            type: "null",
        }],
    },
} as const;

export const paramDef = {
    type: "object",
    properties: {
        host: { type: "string" },
    },
    required: ["host"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
    const instance = await Instances
        .findOneBy({ host: toPuny(ps.host) });

    return instance ? await Instances.pack(instance) : null;
});
