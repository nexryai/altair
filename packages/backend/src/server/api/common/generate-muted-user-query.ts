import { SelectQueryBuilder, Brackets } from "typeorm";
import { User } from "@/models/entities/user.js";
import { Followings, Mutings, UserProfiles } from "@/models/index.js";

export function generateMutedUserQuery(q: SelectQueryBuilder<any>, me: { id: User["id"] }, exclude?: User) {
    const mutingQuery = Mutings.createQueryBuilder("muting")
        .select("muting.muteeId")
        .where("muting.muterId = :muterId", { muterId: me.id });

    const followingQuery = Followings.createQueryBuilder("following")
        .select("following.followeeId")
        .where("following.followerId = :followerId", { followerId: me.id });

    if (exclude) {
        mutingQuery.andWhere("muting.muteeId != :excludeId", { excludeId: exclude.id });
    }

    const mutingInstanceQuery = UserProfiles.createQueryBuilder("user_profile")
        .select("user_profile.mutedInstances")
        .where("user_profile.userId = :muterId", { muterId: me.id });

    // 投稿の作者をミュートしていない かつ
    // 投稿の返信先の作者をミュートしていない かつ
    // 投稿の引用元の作者をミュートしていない
    q
        .andWhere(`note.userId NOT IN (${ mutingQuery.getQuery() })`)
        .andWhere(new Brackets(qb => { qb
            .where("note.replyUserId IS NULL")
            .orWhere(`note.replyUserId NOT IN (${ mutingQuery.getQuery() })`);
        }))
        .andWhere(new Brackets(qb => { qb
            .where("note.renoteUserId IS NULL")
            .orWhere(`note.renoteUserId NOT IN (${ mutingQuery.getQuery() })`);
        }))
    // mute instances
        .andWhere(new Brackets(qb => { qb
            .andWhere("note.userHost IS NULL")
            .orWhere(`NOT ((${ mutingInstanceQuery.getQuery() })::jsonb ? note.userHost)`);
        }))
        .andWhere(new Brackets(qb => { qb
            .where("note.replyUserHost IS NULL")
            .orWhere(`NOT ((${ mutingInstanceQuery.getQuery() })::jsonb ? note.replyUserHost)`);
        }))
        .andWhere(new Brackets(qb => { qb
            .where("note.renoteUserHost IS NULL")
            .orWhere(`NOT ((${ mutingInstanceQuery.getQuery() })::jsonb ? note.renoteUserHost)`);
        }));

    q.setParameters(mutingQuery.getParameters());
    q.setParameters(mutingInstanceQuery.getParameters());
}

export function generateMutedUserQueryForUsers(q: SelectQueryBuilder<any>, me: { id: User["id"] }) {
    const mutingQuery = Mutings.createQueryBuilder("muting")
        .select("muting.muteeId")
        .where("muting.muterId = :muterId", { muterId: me.id });

    q.andWhere(`user.id NOT IN (${ mutingQuery.getQuery() })`);

    q.setParameters(mutingQuery.getParameters());
}
