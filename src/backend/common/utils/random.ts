export function getRandomCryptoIntInclusive(min: number, max: number): number {
    const range = max - min + 1;
    if (range <= 0) {
        throw new Error('max must be larger than min');
    }

    const requestBytes = Math.ceil(Math.log2(range) / 8);
    if (!requestBytes) {
        // No randomness required
        return min;
    }

    const maxNum = Math.pow(256, requestBytes);
    const cryptoBytes = new Uint8Array(requestBytes);

    while (true) {
        window.crypto.getRandomValues(cryptoBytes);

        let val = 0;
        for (let i = 0; i < requestBytes; i++) {
            val = (val << 8) + cryptoBytes[i];
        }

        if (val < maxNum - (maxNum % range)) {
            return min + (val % range);
        }
    }
}
