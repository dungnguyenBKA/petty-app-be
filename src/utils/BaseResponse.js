export default function createResponse(data, message = "") {
    return {
        data: data,
        message: message
    }
}