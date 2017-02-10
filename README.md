# churchteams-to-rock

This is a quick and dirty project to migrate data from ChurchTeams CSV to Rock Excavator CSV files.
It also considers a list of "active names" -- a listing of folks who may not be in our existing
ChurchTeams CSV export -- and a MailChimp CSV export for determining active email addresses.

There are a few weird hardcoded transformations. You should probably fork this project and make
your own modifications.

## Usage

Requires Node.js v6.

    npm install -g awakening-church/churchteams-to-rock
    churchteams-to-rock --help

Again -- you probably want to fork this project instead of running our code.

