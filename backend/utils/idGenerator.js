function generateRegistrationId() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CE-2026-${random}`;
}

function generateTicketCode() {
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `TKT-${random}`;
}

module.exports = {
    generateRegistrationId,
    generateTicketCode
};