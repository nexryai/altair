import { promisify } from "node:util";
import * as crypto from "node:crypto";
import { UserProfiles, AttestationChallenges } from "@/models/index.js";
import { comparePassword } from "@/misc/password.js";
import { genId } from "@/misc/gen-id.js";
import define from "../../../define.js";
import { hash } from "../../../2fa.js";

const randomBytes = promisify(crypto.randomBytes);

export const meta = {
    requireCredential: true,

    secure: true,
} as const;

export const paramDef = {
    type: "object",
    properties: {
        password: { type: "string" },
    },
    required: ["password"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
    const profile = await UserProfiles.findOneByOrFail({ userId: user.id });

    // Compare password
    const same = await comparePassword(ps.password, profile.password!);

    if (!same) {
        throw new Error("incorrect password");
    }

    if (!profile.twoFactorEnabled) {
        throw new Error("2fa not enabled");
    }

    // 32 byte challenge
    const entropy = await randomBytes(32);
    const challenge = entropy.toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    const challengeId = genId();

    await AttestationChallenges.insert({
        userId: user.id,
        id: challengeId,
        challenge: hash(Buffer.from(challenge, "utf-8")).toString("hex"),
        createdAt: new Date(),
        registrationChallenge: true,
    });

    return {
        challengeId,
        challenge,
    };
});
