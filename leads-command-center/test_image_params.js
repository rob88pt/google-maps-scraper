const https = require('https');

const baseUrl = 'https://lh3.googleusercontent.com/p/AF1QipOfuuA3NNpiC7bRaSTn1e2_rSehp2RKjd57rHWB';

const variants = [
    '=s973-k-no',   // User's example
    '=s0',          // Max size?
    '=s2048',       // Specific large size
    '',             // No params
    '=w400-h300-k-no' // Typical scraper format
];

function checkUrl(params) {
    const url = baseUrl + params;
    return new Promise((resolve) => {
        https.get(url, (res) => {
            console.log(`Params: "${params}" -> Status: ${res.statusCode}, Content-Length: ${res.headers['content-length']}`);
            resolve();
        }).on('error', (e) => {
            console.log(`Params: "${params}" -> Error: ${e.message}`);
            resolve();
        });
    });
}

async function run() {
    for (const v of variants) {
        await checkUrl(v);
    }
}

run();
