'use strict';

const Csv = require('csv');
const Fs = require('fs');

const parser = process.stdin.pipe(Csv.parse({
    columns: true
}));

parser.on('readable', () => {
    let data;
    while (data = parser.read()) {
        process.stdout.write(JSON.stringify(data));
    }
});
