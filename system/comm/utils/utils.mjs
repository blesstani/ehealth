export function logMessage(message) {
    console.log(`[LOG]: ${message}`);
}

export function getCurrentTimestamp() {
    return new Date().toISOString();
}
