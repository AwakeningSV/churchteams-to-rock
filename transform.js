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

const normalizeNames = (names) => {

    return names.map((name) => {

        const parts = name.Name.split(' ');

        return {
            FirstName: parts.shift(),
            LastName: parts.join(' '),
            ConnectionStatus: 'Attendee',
            RecordStatus: 'Active'
        };
    });
};

const normalizeEmails = (emails) => {

    return emails.map((email) => {

        return {
            FirstName: email['First Name'],
            LastName: email['Last Name'],
            Email: email['Email Address'],
            IsEmailActive: 'Yes',
            'Allow Bulk Email?': 'Yes'
        };
    });
};

const CT_FIELDS = [
    'LastName',
    'FirstName',
    'Address1',
    'Address2',
    'City',
    'State',
    'ZipCode',
    'HomePhone',
    'WorkPhone',
    'MobilePhone',
    'EmailAddress',
    'FamilyID',
    'MemberID',
    'ChurchMemberTypeDescription',
    'Gender', // M, F, U
    'AgeCategory', // Extended
    'DateCreated', // ISO 8601
    'Birth Date', // MM/DD/YYYY
    'Marital Status', // Extended?
    'First Visit' // MM/DD/YYYY
];

const transformGender = (gender) => {

    gender = gender.toLowerCase();

    if (gender === 'u') {
        return '';
    }

    if (gender !== 'm' && gender !== 'f') {
        return '';
    }

    return gender;
};

const normalizeDate = (date) => {

    if (date) {

        const parts = date.split('/');
        date = [parts[2], parts[0], parts[1]].join('-');
    }

    return date;
};

const normalizeISODate = (date) => {

    // Cheat a bit.
    if (date) {

        date = date.split(' ').shift();
    }

    return date;
};

const normalizeMartialStatus = (status) => status;

const normalizeState = (state) => {

    state = state.trim();
    state = state.toUpperCase();

    if (state.length == 2) {
        return state;
    }

    if (state === 'CALIFORNIA') {
        return 'CA';
    }

    if (state === 'NORTH CAROLINA') {
        return 'NC';
    }

    if (state === 'TEXAS') {
        return 'TX';
    }

    if (state === 'CANADA') {
        // Not a state! >_<
        return '';
    }

    if (state === '95123') {
        // Good times
        return 'CA';
    }

    return state;
};

const normalizeIndividuals = (individuals) => {

    return individuals.map((entry) => {

        let Country = 'US';

        // Fix for Canadians.
        if (entry.State.toUpperCase() === 'CANADA') {
            Country = 'CA';
        }

        return {
            FamilyId: entry.FamilyID,
            PersonId: entry.MemberID,
            LastName: entry.LastName,
            FirstName: entry.FirstName,
            Address: entry.Address1,
            Address2: entry.Address2,
            City: entry.City,
            State: normalizeState(entry.State), // TODO must verify
            ZipCode: entry.ZipCode,
            Country,
            Campus: 'Del Mar High School',
            Gender: transformGender(entry.Gender),
            HomePhone: entry.HomePhone,
            WorkPhone: entry.WorkPhone,
            MobilePhone: entry.MobilePhone,
            Email: entry.EmailAddress,
            DateOfBirth: normalizeDate(entry['Birth Date']),
            CreatedDate: normalizeISODate(entry.DateCreated),
            MartialStatus: normalizeMartialStatus(entry['Marital Status']),
            FirstVisit: normalizeDate(entry['First Visit']),
            AgeCategory: entry.AgeCategory
        };
    });
};

module.exports = (argv) => {

    Promise.all([
        pluckFromCSV(['Name'], argv['active-names-file']),
        pluckFromCSV(['Email Address', 'First Name', 'Last Name'], argv['email-file']),
        pluckFromCSV(CT_FIELDS, argv['ct-file'])
    ]).then((values) => {

        const activeNames = normalizeNames(values[0]);
        const activeEmails = normalizeEmails(values[1]);
        const individuals = normalizeIndividuals(values[2]);

        console.log({
            activeNames,
            activeEmails,
            individuals
        });

        console.log('Processing %s individuals with %s active names and %s active emails',
            individuals.length,
            activeNames.length,
            activeEmails.length);
    });

};
