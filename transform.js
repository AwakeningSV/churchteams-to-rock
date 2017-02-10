'use strict';

const Fs = require('fs');
const Csv = require('csv');

const parseChurchTeams = (stream) => {

    const parser = stream.pipe(Csv.parse({
        columns: true
    }));

    parser.on('readable', () => {
        let data;
        while (data = parser.read()) {
            
            process.stdout.write(JSON.stringify(data));
        }
    });
};

const pluckFromCSV = (keys, file) => {

    if (!file) {
        return [];
    }

    const stream = Fs.createReadStream(file);

    return new Promise((resolve, reject) => {

        let out = [];

        const parser = stream.pipe(Csv.parse({
            columns: true
        }));

        parser.on('readable', () => {
            let data;
            while (data = parser.read()) {
            
                let entry = {};
                keys.forEach((key) => {
                    entry[key] = data[key];
                });
                 
                out.push(entry);
            }
        });

        parser.once('error', (err) => reject(err));
        parser.once('end', () => resolve(out));
    });
};

const normalizeNames = (names) => names;
const normalizeEmails = (emails) => emails;

module.exports = (argv) => {

    Promise.all([
        pluckFromCSV(['Name'], argv['active-names-file']),
        pluckFromCSV(['Email Address', 'First Name', 'Last Name'], argv['email-file'])
    ]).then((values) => {

        const activeNames = normalizeNames(values[0]);
        const activeEmails = normalizeEmails(values[1]);

        console.log({
            activeNames,
            activeEmails
        });
    });
        //parseChurchTeams(Fs.createReadStream(argv['ct-file']));

};