//----------------------------------------------------------------------------------------------------------------------
// Ship randomizer
//----------------------------------------------------------------------------------------------------------------------

var fs = require('fs');
var _ = require('lodash');

var program = require('commander');

//----------------------------------------------------------------------------------------------------------------------

var ships = [];
var builds = [];

//----------------------------------------------------------------------------------------------------------------------

function shuffle(array)
{
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;

    // While there remain elements to shuffle...
    while(0 !== currentIndex)
    {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    } // end while

    return array;
} // end shuffle

//----------------------------------------------------------------------------------------------------------------------

program
    .usage('[options] <file ...>')
    .option('-n, --numPlayers <n>', 'The number of players to build fleets for.', parseInt)
    .option('-p, --points <n>', 'The number of points for each fleet.', parseFloat)
    .parse(process.argv);

var POINTS = program.points || 100;
var PLAYERS = program.numPlayers || 2;
var FILE = program.args[0] || './collection.txt';

//----------------------------------------------------------------------------------------------------------------------

fs.readFile(FILE, { encoding: 'utf8' }, (error, shipData) =>
{
    if(error)
    {
        console.error(`You failed!`, error.stack || error.message);
    }
    else
    {
        ships = _(shipData.replace('\r\n', '\n').split('\n'))
            .compact()
            .map((line) =>
            {
                var parts = line.split('\t');
                var name = parts[0];
                var cost = parseInt(parts[1]);

                return { name, cost };
            })
            .value();

        // Shuffle the ships
        ships = shuffle(ships);

        // Build our lists
        builds = _.map(_.range(PLAYERS), () => []);

        // We go through the entire list, and attempt to build randomized ship lists
        while(ships.length > 0)
        {
            var ship = ships.pop();

            _.each(builds, (buildList) =>
            {
                var pointTotal = _.reduce(buildList, (total, shipObj) => total += shipObj.cost, 0);
                var remaining = POINTS - pointTotal;

                if(ship.cost <= remaining)
                {
                    buildList.push(ship);
                    return false;
                } // end if
            });
        } // end while

        //--------------------------------------------------------------------------------------------------------------
        // Output
        //--------------------------------------------------------------------------------------------------------------

        console.log('');

        _.each(builds, (buildList, index) =>
        {
            var pointTotal = _.reduce(buildList, (total, shipObj) => total += shipObj.cost, 0);

            console.log(`Player ${ index + 1 } (${ pointTotal }):`);

            _.each(buildList, (ship) =>
            {
                console.log(`    ${ ship.name } (${ ship.cost })`)
            });

            console.log('');
        });
    } // end if
});

//----------------------------------------------------------------------------------------------------------------------