import _ from "lodash";

export function pickPropertyUser(user) {
    return _.pick(user, "name", "id")
}

export function pickPropertyChannel(channel) {
    return _.pick(channel, "userIds", "id")
}

export function pickPropertyMessage(mess) {
    return _.pick(mess, "channel_id", "_id", "message")
}
