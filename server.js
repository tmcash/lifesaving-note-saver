const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");
const notes = require("./db/db.json");
const PORT = process.env.PORT || 3001;

// Helper method for generating unique ids
const uuid = require("./db/helpers/uuid");

// initialize app
const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// get route for notes.html file
app.get("/notes", (req, res) =>
res.sendFile(path.join(__dirname, "/public/notes.html"))
);

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
);

// api get route to read db.json file
app.get("/api/notes", (req, res) => {
console.info(`${req.method} request received for notes`);
readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

// defining readAndAppend
const readAndAppend = (content, file) => {
fs.readFile(file, "utf8", (err, data) => {
    if (err) {
    console.error(err);
    } else {
    const parsedData = JSON.parse(data);
    parsedData.push(content);
    writeToFile(file, parsedData);
    }
});
};

// post route for new note
app.post("/api/notes", (req, res) => {
console.info(`${req.method} request received to add a new note`);

const { title, text } = req.body;

if (req.body) {
    const newNote = {
    title,
    text,
    id: uuid(),
    };

    readAndAppend(newNote, "./db/db.json");
    res.json(`Note added successfully 🚀`);
} else {
    res.error("Error in adding note");
}
});

// delete notes
function deleteNote(id, parsedData) {
console.log(parsedData);
for (let i = 0; i< parsedData.length; i++){
    let note = parsedData[i];

    if (note.id == id) {
        parsedData.splice(i, 1);
        console.log(parsedData);


        break;
    }
}
return parsedData;
}

const readAndDelete = (id, file) => {
fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
    console.error(err);
} else {
    let parsedData = JSON.parse(data);
    parsedData = deleteNote(id, parsedData);
    writeToFile(file, parsedData);
}
});
};


app.delete('/api/notes/:id', (req, res) => {
readAndDelete(req.params.id, './db/db.json');
res.json(true);
});

// get route for index.html file - put at the end since it's a wild card
app.get("/*", (req, res) =>
res.sendFile(path.join(__dirname, "/public/index.html"))
);

app.listen(PORT, () =>
console.log(`App listening at http://localhost:${PORT} 🚀`)
);