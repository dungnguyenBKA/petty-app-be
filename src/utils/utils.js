import _ from "lodash";

export function pickPropertyUser(user) {
  return _.omit(user, ['pass']);
}

export function pickPropertyChannel(channel) {
  return _.omit(channel, ["__v"])
}

export function pickPropertyMessage(mess) {
  return _.pick(mess, "channel_id", "_id", "message")
}
