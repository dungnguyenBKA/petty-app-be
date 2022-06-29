import _ from "lodash";

export function pickPropertyUser(user) {
    return _.pick(user, "name", "id")
}
