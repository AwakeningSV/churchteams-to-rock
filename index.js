'use strict';

const Yargs = require('yargs');
const Csv = require('csv');
const Fs = require('fs');

const Transform = require('./transform');

const argv = Yargs.usage('Usage: $0 <command> [options]')
    .command('transform', 'Transform source CSV data into Excavator CSV data')
    .example(
        '$0 transform -i churchteams.csv -e email.csv -a active_names.csv -f out_famlily.csv -p out_individual.csv',
        'transform data from ChurchTeams, an email list, and a list of known active members to Excavator output files'
    )
    .alias('i', 'ct-file')
    .alias('e', 'email-file')
    .alias('a', 'active-names-file')
    .alias('f', 'output-family-file')
    .alias('p', 'output-individual-file')
    .describe('i', 'ChurchTeams export CSV')
    .describe('e', 'Email list CSV')
    .describe('a', 'Active member CSV')
    .describe('f', 'Excavator Family CSV output')
    .describe('p', 'Excavator Individual CSV output')
    .demandOption(['i', 'f', 'p'])
    .epilog(
        'This software comes with ABSOLUTELY NO WARRANTY. ' +
        'Read the source code of this software before you use it.'
    ).argv;

Transform(argv);
