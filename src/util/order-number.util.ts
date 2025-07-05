import crypto from 'crypto';

export const generateOrderPin = (): number => {
    const buffer = crypto.randomBytes(3);
    const num = parseInt(buffer.toString('hex'), 16);
    return 100000 + (num % 900000);
};