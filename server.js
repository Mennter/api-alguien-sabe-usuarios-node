const { Client } = require('@elastic/elasticsearch')
const config = require('./config');
const client = new Client({ node: config.baseURL, log: 'trace' })
const jwt = require('jsonwebtoken');

const express = require('express');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const rutasProtegidas = express.Router();
rutasProtegidas.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (token.includes('Bearer ')) {
        const t = token.substring(7).toString()
        jwt.verify(t, config.key, function(err, decoded)  {
            if (err) {
                console.log(err)
                return res.json({ mensaje: 'Token inválida' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.send({
            mensaje: 'Token no proveída.'
        });
    }
})

/**
 * POST Comentario
 */
app.post('/comentario', rutasProtegidas, function (req, res) {
    client.index({
        index: 'comentario',
        type: '_doc',
        body: req.body
    }).then((json) => {
        const search = []
        res.send({ id: json.body._id , ...req.body});
    }).catch((error) => {
        console.log(error)
        res.send(error)
    });

});

/**
 * Get Comentario por ID
 */
app.get('/comentario/:id', rutasProtegidas, function (req, res) {
    client.search({
        index: 'comentario',
        body: {
            query: {
                ids: {
                    values: req.params.id
                }
            }
        }
    }).then((json) => {
        const search = []
        json.body.hits.hits.forEach(hits => {
            search.push({ ...hits._source, id: hits._id })
        });
        res.send(search[0] ? search[0] : {});
    }).catch((error) => {
        console.log(error)
        res.send(error)
    });

});


/**
 * Busqueda 
 */
app.get('/comentario', rutasProtegidas, function (req, res) {


    let query = {
        query: {
            match_all: {}
        }
    }

    if(req.query.q) {
        query = {
            query: {
                match: {
                    texto: {
                        query: req.query.q
                    }
                }
            }
        }
    } 

    client.search({
        index: 'comentario',
        body: query
    }).then((json) => {
        const search = []
        json.body.hits.hits.forEach(hits => {
            search.push({ ...hits._source, id: hits._id })
        });
        res.send(search);
    }).catch((error) => {
        console.log(error)
        res.send(error)
    });

});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});