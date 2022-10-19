const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const generateUniqueId = require('generate-unique-id');
const errorHandler = require('errorhandler');

// middleware for all paths
app.use(errorHandler())
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(express.static('public'));

const PORT = process.env.PORT || 4001;

// Returns index.html file 
app.get('/', (req, res) => {
    res.sendFile('public/index.html', { root: __dirname });
})

// Returns notes.html file 
app.get('/notes', (req, res) => {
    res.status(200).sendFile('public/notes.html', { root: __dirname });
})

// Returns all the notes from db.json file 
app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        res.status(200).send(data);
    })
})

// Handles posted data. Create a newNote variable to store the data from the request body, parse the json
// data from db.json and push the newNote to the array. Then stringify the array and write to the db.json file
app.post('/api/notes', (req, res) => {
    const newNote = {
        id: generateUniqueId({
            length: 5,
            useLetters: false
        }),
        title: req.body.title,
        text: req.body.text
    }
    if (newNote.title && newNote.text) {
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            const notes = JSON.parse(data);
            notes.push(newNote);
            fs.writeFile('./db/db.json', JSON.stringify(notes), (err, data) => {
                res.status(201).send(newNote);
            })
        })
    } else {
        res.status(400).send()
    }
})

// The id is parsed in req.params object. Find the element in the array with the id same from the request, then
// delete that element from the array and stringify the array.
app.delete('/api/notes/:id', (req, res) => {
    const id = req.params.id;
    if (id) {
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            const notes = JSON.parse(data);
            const index = notes.findIndex((note) => note.id == id);
            if (index !== -1) {
                notes.splice(index,1);
                fs.writeFile('./db/db.json', JSON.stringify(notes), (err, data) => {
                    res.status(204).send();
                })
            } else {
                res.status(404).send()
            }
        })
    }
})

app.listen(PORT, () => {
    console.log(`server is listening to port ${PORT}`)
})

