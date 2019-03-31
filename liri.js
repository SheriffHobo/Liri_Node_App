require("dotenv").config();

const fs = require("fs");
const keys = require("./keys.js");
const request = require('request');
const Spotify = require('node-spotify-api');
const spotify = new Spotify(keys.spotify);

const action = process.argv[2];
const parameter = process.argv[3];

function switchCase() {
    switch (action) {
        case 'concert-this':
            bandsInTown(parameter);
            break;
        case 'spotify-this-song':
            spotSong(parameter);
            break;
        case 'movie-this':
            movieInfo(parameter);
            break;
        case 'do-what-it-says':
            getRandom();
            break;
        default:
            logIt("Invalid Parameter");
            break;
    };
};

// BANDS IN TOWN
function bandsInTown(parameter) {
    let bandsName = "";
    if (action === 'concert-this') {
        for (let i = 3; i < process.argv.length; i++) {
            bandsName += process.argv[i];
        }
        console.log(bandsName);
    } else {
        bandsName = parameter;
    };

    const queryUrl = "https://rest.bandsintown.com/artists/" + bandsName + "/events?app_id=codecademy";

    request(queryUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            const JS = JSON.parse(body);
            for (i = 0; i < JS.length; i++) {
                const dTime = JS[i].datetime;
                const month = dTime.substring(5, 7);
                const year = dTime.substring(0, 4);
                const day = dTime.substring(8, 10);
                const dateForm = month + "/" + day + "/" + year
                logIt("\n---------------------------------------------------\n");
                logIt("Date: " + dateForm);
                logIt("Name: " + JS[i].venue.name);
                logIt("City: " + JS[i].venue.city);
                if (JS[i].venue.region !== "") {
                    logIt("Country: " + JS[i].venue.region);
                };
                logIt("Country: " + JS[i].venue.country);
                logIt("\n---------------------------------------------------\n");
            };
        };
    });
};

// SPOTIFY
function spotSong(parameter) {
    let searchTrack;
    if (parameter === undefined) {
        searchTrack = "Purple Rain";
    } else {
        searchTrack = parameter;
    };
    spotify.search({
        type: 'track',
        query: searchTrack
    }, function (error, data) {
        if (error) {
            logIt('Error occurred: ' + error);
            return;
        } else {
            logIt("\n---------------------------------------------------\n");
            logIt("Artist: " + data.tracks.items[0].artists[0].name);
            logIt("Song: " + data.tracks.items[0].name);
            logIt("Preview: " + data.tracks.items[3].preview_url);
            logIt("Album: " + data.tracks.items[0].album.name);
            logIt("\n---------------------------------------------------\n");
        };
    });
};

// OMDB
function movieInfo(parameter) {
    let findMovie;
    if (parameter === undefined) {
        findMovie = "Big Trouble In Little China";
    } else {
        findMovie = parameter;
    };

    const queryUrl = "http://www.omdbapi.com/?t=" + findMovie + "&y=&plot=short&apikey=trilogy";

    request(queryUrl, function (err, res, body) {
        const bodyOf = JSON.parse(body);
        if (!err && res.statusCode === 200) {
            logIt("\n---------------------------------------------------\n");
            logIt("Title: " + bodyOf.Title);
            logIt("Release Year: " + bodyOf.Year);
            logIt("IMDB Rating: " + bodyOf.imdbRating);
            logIt("Rotten Tomatoes Rating: " + bodyOf.Ratings[1].Value);
            logIt("Country: " + bodyOf.Country);
            logIt("Language: " + bodyOf.Language);
            logIt("Plot: " + bodyOf.Plot);
            logIt("Actors: " + bodyOf.Actors);
            logIt("\n---------------------------------------------------\n");
        };
    });
};

// DO WHAT IT SAYS
function getRandom() {
    fs.readFile('random.txt', "utf8", function (error, data) {
        if (error) {
            return logIt(error);
        }

        const dataArr = data.split(",");

        if (dataArr[0] === "spotify-this-song") {
            const songcheck = dataArr[1].trim().slice(1, -1);
            spotSong(songcheck);
        } else if (dataArr[0] === "concert-this") {
            if (dataArr[1].charAt(1) === "'") {
                const dLength = dataArr[1].length - 1;
                const data = dataArr[1].substring(2, dLength);
                console.log(data);
                bandsInTown(data);
            } else {
                const bandName = dataArr[1].trim();
                console.log(bandName);
                bandsInTown(bandName);
            }
        } else if (dataArr[0] === "movie-this") {
            const movie_name = dataArr[1].trim().slice(1, -1);
            movieInfo(movie_name);
        }
    });
};

function logIt(dataToLog) {
    console.log(dataToLog);
    fs.appendFile('log.txt', dataToLog + '\n', function (err) {
        if (err) return logIt('Error logging data to file: ' + err);
    });
};

switchCase();
