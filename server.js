const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const generateUniqueId = require('generate-unique-id');
const errorHandler = require('errorhandler');

app.use(errorHandler())
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(express.static('public'));

const PORT = process.env.PORT || 4001;

app.get('/', (req, res) => {
    res.sendFile('public/index.html', { root: __dirname });
})

app.get('/notes', (req, res) => {
    res.sendFile('public/notes.html', { root: __dirname });
})

app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        res.status(200).send(data);
    })
})

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
                res.send(newNote);
            })
        })
    } else {
        res.status(400).send()
    }
})

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

