/**
 * Calculate expiry date from a time string like "7d" or number of seconds
 * @param expiry The expiry time (e.g., "7d", "1h", or number in seconds)
 * @returns Date object representing the expiry date
 */
export function calculateExpiryDate(expiry: string | number): Date {
    if (typeof expiry === 'number') {
        return new Date(Date.now() + expiry * 1000);
    }

    const match = expiry.match(/^(\d+)([smhdw])$/);
    if (!match) {
        throw new Error(`Invalid expiry format: ${expiry}. Use format like "7d", "24h", "60m", etc.`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    let milliseconds = 0;
    switch (unit) {
        case 's': milliseconds = value * 1000; break;
        case 'm': milliseconds = value * 60 * 1000; break;
        case 'h': milliseconds = value * 60 * 60 * 1000; break;
        case 'd': milliseconds = value * 24 * 60 * 60 * 1000; break;
        case 'w': milliseconds = value * 7 * 24 * 60 * 60 * 1000; break;
        default: throw new Error(`Unknown time unit: ${unit}`);
    }

    return new Date(Date.now() + milliseconds);
}