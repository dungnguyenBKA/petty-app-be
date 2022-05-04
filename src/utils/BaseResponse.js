export default function createResponse(message = "", data = undefined) {
    return {
        message,
        data
    }
}
