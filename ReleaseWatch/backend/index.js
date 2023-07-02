const express = require("express");
const Axios = require("axios");
const bodyParser = require("body-parser");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const fastcolor = require("fast-average-color-node");


var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'INSERT LOCAL PASSWORD HERE',
    database: 'releasewatch'
})
// var db = mysql.createConnection({
//     host: 'gcp ip here',
//     user: 'root',
//     password: 'gcp password here',
//     database: 'releasewatch'
// })
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.get("/api/get/games", (require, response) => {
    const sqlSelect = "SELECT * FROM Games WHERE releaseDate > ? ORDER BY releaseDate ASC LIMIT 50";
    db.query(sqlSelect, [new Date() / 1000], (err, result) => {
        response.send(result);
    });
});

app.get("/api/get/companies", (require, response) => {
    const sqlSelect = "SELECT companyID, companyName FROM Companies";
    db.query(sqlSelect, (err, result) => {
        response.send(result);
    })
})

app.post("/api/post/companies/id", (require, response) => {
    const sqlSelect = "SELECT companyName FROM Companies WHERE companyID = ? LIMIT 1";
    let id = require.body.companyID;
    // console.log(id);
    db.query(sqlSelect, [id], (err, result) => {
        // console.log(result);
        response.send(result);
    })
})

app.get("/api/get/submissions", (require, response) => {
    const sqlSelect = "SELECT * FROM Submission WHERE NOT approved";
    db.query(sqlSelect, (err, result) => {
        response.send(result);
    })
})

app.post("/api/post/news", (require, response) => {
    let gameID = require.body.id;
    let text = require.body.text;
    let submittedBy = require.body.user;
    const sqlNewsInsert = "INSERT INTO News VALUES ((SELECT MAX(n.newsID) FROM News n) + 1, ?, ?)";
    const sqlNewsOnInsert = "INSERT INTO NewsOn VALUES (?, (SELECT MAX(n.newsID) FROM NewsOn n) + 1)";
    db.query(sqlNewsInsert, [text, submittedBy], (err, result) => {
        db.query(sqlNewsOnInsert, [gameID], (err, result) => {
        })
    })
})

app.post("/api/post/get_news", (require, response) => {
    let gameID = require.body.gameID;
    const sqlQuery = "SELECT * FROM News WHERE newsID in (SELECT newsID from NewsOn WHERE gameID = ?) ORDER BY newsID DESC";
    db.query(sqlQuery, [gameID], (err, result) => {
        // console.log(sqlQuery, gameID);
        response.send(result);
    })
})

app.post(("/api/avgcolor/"), (require, response) => {
    const url = require.body.url;
    fastcolor.getAverageColor(url).then(color => {
        response.send(color);
    });
});

app.post("/api/post/artwork", (require, response) => {
    const game = require.body.gameID;
    Axios.post(
        'https://api.igdb.com/v4/artworks',
        'fields game, url;\nwhere game = ' + game + ';\nlimit 1;',
        {
            headers: {
                'Access-Control-Allow-Credentials':true,
                'authorization': 'Bearer API-KEY',
                'cache-control': 'no-cache',
                'client-id': 'API-CLIENT-ID',
                'content-type': 'application/x-www-form-urlencoded'
            }
        }
    ).then((r)=> {
        response.send(r.data);
    }).catch(err=> {
        // console.log(err);
    })
});

app.post("/api/post/screenshots", (require, response) => {
    const game = require.body.gameID;
    Axios.post(
        'https://api.igdb.com/v4/screenshots',
        'fields game, url;\nwhere game = ' + game + ';\nlimit 10;',
        {
            headers: {
                'Access-Control-Allow-Credentials':true,
                'authorization': 'Bearer API-KEY',
                'cache-control': 'no-cache',
                'client-id': 'API-CLIENT-ID',
                'content-type': 'application/x-www-form-urlencoded'
            }
        }
    ).then((r)=> {
        response.send(r.data);
    }).catch(err=> {
        // console.log(err);
    })
});

app.post("/api/post/longevity_statistics/", (require, response) => {
    const minYear = require.body.minYear;
    const maxYear = require.body.maxYear;
    // // console.log(minYear, maxYear);
    const msMin = new Date().setFullYear(minYear) / 1000;
    const msMax = new Date().setFullYear(maxYear) / 1000;
    // // console.log(msMin, msMax);
    const sqlSelect = "(select DISTINCT c.companyName,g.name, g.releaseDate FROM Games g JOIN WorkedOn w ON g.gameID = w.gameID JOIN Companies c ON w.companyID = c.companyID where g.releaseDate < ? limit 8 ) UNION (select DISTINCT c.companyName,g.name,g.releaseDate FROM Games g JOIN WorkedOn w ON g.gameID = w.gameID JOIN Companies c ON w.companyID = c.companyID where g.releaseDate > ? limit 8);"
    db.query(sqlSelect, [msMin, msMax], (err, result) => {
        response.send(result);
    })
})

app.get("/api/get/trending_users/", (require, response) => {
    const sqlSelect = "SELECT DISTINCT name, submittedBy,points FROM Users JOIN Games ON submittedBy = username WHERE points < (SELECT AVG(points) FROM Users) ORDER BY points ASC limit 15;"
    db.query(sqlSelect, (err, result) => {
        response.send(result);
    })
})

app.get("/api/get/most_anticipated", (require, response) => {
    const sqlSelect = "CALL GetAnticipatedGames;"
    db.query(sqlSelect, (err, result) => {
        response.send(result);
    })
})

app.get("/api/get/best_companies", (require, response) => {
    const sqlSelect = "CALL RateCompanies;"
    db.query(sqlSelect, (err, result) => {
        response.send(result);
    })
})



app.post("/api/post/search/games", (require, response) => {
    // // console.log(require.body.query);
    const query = "%" + require.body.query + "%";
    const sqlSelect = "SELECT * FROM Games WHERE name LIKE ? ORDER BY releaseDate ASC LIMIT 50";
    db.query(sqlSelect, [query], (err, result) => {
        response.send(result);
        if (err) {
            // console.log(err);
        }
    });
});

app.post("/api/post/games/id", (require, response) => {
    const query = require.body.queryID;
    const sqlSelect = "SELECT * FROM Games WHERE gameID = ?";
    db.query(sqlSelect, [query], (err, result) => {
        response.send(result);
        if (err) {
            // console.log(err);
        }
    });
});

app.post("/api/post/delete/games/", (require, response) => {
    const id = require.body.id;
    const sqlWorkedOnDelete = "DELETE FROM WorkedOn WHERE gameID = ?;";
    db.query(sqlWorkedOnDelete, [id], (err, result) => {
        if (err) {
            // console.log(err);
        }
        const sqlDelete = "DELETE FROM Games WHERE gameID = ?";
        db.query(sqlDelete, [id], (err, result) => {
            response.send(result);
            if (err) {
                // console.log(err);
            }
        })
    })
})

app.post("/api/post/update/games/", (require, response) => {
    const id = require.body.id;
    const name = require.body.name;
    const desc = require.body.description;
    const sqlEdit = "UPDATE Games SET name = ?, description = ? WHERE gameID = ?"
    db.query(sqlEdit, [name, desc, id], (err, result) => {
        response.send(result);
        if (err) {
            // console.log(err);
        }
    });
})

app.post("/api/post/login", (require, response) => {
    const sqlSelect = "SELECT * FROM Users WHERE username = ? AND password = ?";
    db.query(sqlSelect, [require.body.username, require.body.password], (err, result) => {
        response.send(result);
        if (err) {
            // console.log(err);
        }
    });
});

app.post("/api/post/register", (require, response) => {
    const sqlSelect = "INSERT INTO Users VALUES (?, ?, 0, 0);";
    db.query(sqlSelect, [require.body.username, require.body.password], (err, result) => {
        response.send(result);
        if (err) {
            // console.log(err);
        }
    });
});

app.post("/api/update/submission", (require, response)=> {
    const submissionID = require.body.submissionID;
    const type = require.body.type;
    const rawData = require.body.rawData.replaceAll("'", "");
    const approved = require.body.approved;
    const submitDate = parseInt(require.body.submitDate);
    const submittedBy = require.body.submittedBy;
    const data = rawData.split(",");
    const sqlInsert = "UPDATE `Submission` SET submissionType = ?, rawData = ?, approved = ?, submitDate = ?, createdBy = ? WHERE `submissionID` = ?;"
    // // console.log(sqlInsert);
    db.query(sqlInsert, [type, rawData, approved, submitDate, submittedBy, submissionID], (err, result) => {
        // console.log(err);
    })
    if (approved === 1 && type === "game") {
        Axios.post('http://localhost:3002/api/insert/game', {
            name: data[0],
            description: data[1],
            companyName: data[2].replaceAll("'", ""),
            releaseDate: parseInt(data[3]),
            submittedBy: submittedBy
        }).then((e)=> {
            // console.log(e);
            alert("success insert");
        })
    }
    if (approved === 1 && type === "company") {
        Axios.post('http://localhost:3002/api/insert/company', {
            name: data[0],
            size: data[1],
            submittedBy: data[2]
        }).then((e)=> {
            // console.log(e);
            alert("success insert");
        })
    }
})

app.post("/api/insert/submission", (require, response)=> {
    const type = require.body.type;
    const rawData = require.body.rawData;
    const approved = require.body.approved;
    const submitDate = Math.floor(Date.now() / 1000);
    const createdBy = require.body.createdBy;
    const sqlInsert = "INSERT INTO `Submission` VALUES ((SELECT MAX(s.submissionID) FROM Submission s) + 1, ?, ?, ?, ?, ?);"
    // // console.log(sqlInsert);
    db.query(sqlInsert, [type, rawData, approved, submitDate, createdBy], (err, result) => {
        // console.log(sqlInsert, [type, rawData, approved, submitDate, createdBy]);
        // console.log(err);
    })
})

app.post("/api/delete/submission", (require, response)=> {
    const id = require.body.id;
    const sqlInsert = "DELETE FROM Submission WHERE submissionID = ?;"
    // // console.log(sqlInsert);
    db.query(sqlInsert, [id], (err, result) => {
        // console.log(err);
    })
})

app.post("/api/insert/game", (require, response)=> {
    const name = require.body.name;
    const description = require.body.description;
    const releaseDate = require.body.releaseDate;
    const submittedBy = require.body.submittedBy;
    const companyName = require.body.companyName;
    const sqlInsert = "INSERT INTO `Games` (`gameID`, `name`, `description`, `releaseDate`, `submittedBy`) VALUES ((SELECT MAX(g.gameID) FROM Games g) + 1, ?, ?, ?, ?);"
    const sqlInsert2 = "INSERT INTO WorkedOn VALUES ((SELECT MAX(g.gameID) FROM Games g), 99999, ?);"
    db.query(sqlInsert, [name, description, releaseDate, submittedBy], (err, result) => {
        // console.log(err);
    })
    db.query(sqlInsert2, [companyName]);
})

app.post("/api/insert/company", (require, response)=> {
    const name = require.body.name;
    const size = require.body.size;
    const submittedBy = require.body.submittedBy;
    const sqlInsert = "INSERT INTO `Companies` (`companyID`, `companyName`, `companySize`, `submittedBy`) VALUES ((SELECT MAX(c.companyID) FROM Companies c) + 1, ?, ?, ?);"
    // // console.log(sqlInsert);
    db.query(sqlInsert, [name, size, submittedBy], (err, result) => {
        // console.log(err);
    })
})

app.post("/api/insert/user", (require, response)=> {
    const username = require.body.username;
    const password = require.body.password;
    const isModerator = require.body.isModerator;
    const points = require.body.points;
    const sqlInsert = "INSERT INTO `Users` (`username`, `password`, `isModerator`, `points`) VALUES (?, ?, ?, ?);"
    // // console.log(sqlInsert);
    db.query(sqlInsert, [username, password, isModerator, points], (err, result) => {
        // console.log(err);
    })
})

app.listen(3002, ()=> {
    console.log("running on port 3002");
})

// node index.js