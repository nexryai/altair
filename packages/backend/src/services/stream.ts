import { User } from "@/models/entities/user.js";
import { Note } from "@/models/entities/note.js";
import { UserList } from "@/models/entities/user-list.js";
import config from "@/config/index.js";
import { Antenna } from "@/models/entities/antenna.js";
import {
    StreamChannels,
    AntennaStreamTypes,
    BroadcastTypes,
    DriveStreamTypes,
    InternalStreamTypes,
    MainStreamTypes,
    NoteStreamTypes,
    UserListStreamTypes,
    UserStreamTypes,
} from "@/server/api/stream/types.js";
import { Packed } from "@/misc/schema.js";
import { redisClient } from "@/db/redis.js";

class Publisher {
    private publish = (channel: StreamChannels, type: string | null, value?: any): void => {
        const message = type == null ? value : value == null ?
            { type: type, body: null } :
            { type: type, body: value };

        redisClient.publish(config.host, JSON.stringify({
            channel: channel,
            message: message,
        }));
    };

    public publishInternalEvent = <K extends keyof InternalStreamTypes>(type: K, value?: InternalStreamTypes[K]): void => {
        this.publish("internal", type, typeof value === "undefined" ? null : value);
    };

    public publishUserEvent = <K extends keyof UserStreamTypes>(userId: User["id"], type: K, value?: UserStreamTypes[K]): void => {
        this.publish(`user:${userId}`, type, typeof value === "undefined" ? null : value);
    };

    public publishBroadcastStream = <K extends keyof BroadcastTypes>(type: K, value?: BroadcastTypes[K]): void => {
        this.publish("broadcast", type, typeof value === "undefined" ? null : value);
    };

    public publishMainStream = <K extends keyof MainStreamTypes>(userId: User["id"], type: K, value?: MainStreamTypes[K]): void => {
        this.publish(`mainStream:${userId}`, type, typeof value === "undefined" ? null : value);
    };

    public publishDriveStream = <K extends keyof DriveStreamTypes>(userId: User["id"], type: K, value?: DriveStreamTypes[K]): void => {
        this.publish(`driveStream:${userId}`, type, typeof value === "undefined" ? null : value);
    };

    public publishNoteStream = <K extends keyof NoteStreamTypes>(noteId: Note["id"], type: K, value?: NoteStreamTypes[K]): void => {
        this.publish(`noteStream:${noteId}`, type, {
            id: noteId,
            body: value,
        });
    };

    public publishUserListStream = <K extends keyof UserListStreamTypes>(listId: UserList["id"], type: K, value?: UserListStreamTypes[K]): void => {
        this.publish(`userListStream:${listId}`, type, typeof value === "undefined" ? null : value);
    };

    public publishAntennaStream = <K extends keyof AntennaStreamTypes>(antennaId: Antenna["id"], type: K, value?: AntennaStreamTypes[K]): void => {
        this.publish(`antennaStream:${antennaId}`, type, typeof value === "undefined" ? null : value);
    };

    public publishNotesStream = (note: Packed<"Note">): void => {
        this.publish("notesStream", null, note);
    };
}

const publisher = new Publisher();

export default publisher;

export const publishInternalEvent = publisher.publishInternalEvent;
export const publishUserEvent = publisher.publishUserEvent;
export const publishBroadcastStream = publisher.publishBroadcastStream;
export const publishMainStream = publisher.publishMainStream;
export const publishDriveStream = publisher.publishDriveStream;
export const publishNoteStream = publisher.publishNoteStream;
export const publishNotesStream = publisher.publishNotesStream;
export const publishUserListStream = publisher.publishUserListStream;
export const publishAntennaStream = publisher.publishAntennaStream;
