const http = require('http');

const url = 'http://localhost:3000/api/leads?pageSize=1&hasPhotos=true';

http.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.leads && json.leads.length > 0) {
                const lead = json.leads[0];
                console.log('Lead Title:', lead.title);
                if (lead.images && lead.images.length > 0) {
                    console.log('Scraped Image URL:', lead.images[0].image);
                } else {
                    console.log('Lead has no images despite filter.');
                }
            } else {
                console.log('No leads found with photos.');
            }
        } catch (e) {
            console.error('Error parsing JSON:', e);
        }
    });
});
