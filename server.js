const { Client } = require('@elastic/elasticsearch')
const config = require('./config');
const client = new Client({ node: config.baseURL, log: 'trace' })

const express = require('express');
const bodyParser = require('body-parser');


const validarCampo = require('./validaciones/campos-validos');

const validarAuth = require('./validaciones/authorization');
const { response } = require('express');



const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());


/**
 * POST Comentario
 */
app.post('/comentario', validarAuth.authorization, validarCampo.comentario, function (req, res) {

    req.body.fechaCreacion = (new Date()).toISOString()

    // res.send(req.body);
    client.index({
        index: 'comentario',
        type: '_doc',
        body: req.body
    }).then((json) => {
        const data = { id: json.body._id , ...req.body};
        stream.push_sse(json.body._id, "message", data);
        res.send(data);
    }).catch((error) => {
        console.log(error);
        res.status(500).send({
            code: 500,
            mensaje: error.name,
            error: 'INTERNAL_SERVER_ERROR'
        });
    });

});

/**
 * Get Comentario por ID
 */
app.get('/comentario/:id', validarAuth.authorization, function (req, res) {
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
        console.log(error);
        res.status(500).send({
            code: 500,
            mensaje: error.name,
            error: 'INTERNAL_SERVER_ERROR'
        });
    });

});

// const EventEmitter = require('events');
// const Stream = new EventEmitter();



const Stream = require('./custom-stream');
// const app = express();
const stream = new Stream();

app.use(stream.enable());

/**
 * Refresco de validarAuth.authorization,
 */
app.get('/stream/:id', function (request, response) {
    stream.add(request, response);
});

app.get('/test_route', function (request, response) {
    stream.push_sse("B", "message", {});
    return response.json({ msg: 'admit one' });
});


/**
 * Get Comentarios de comentario padre
 */
app.get('/comentario/:id/comentarios', validarAuth.authorization, function (req, res) {
    client.search({
        index: 'comentario',
        body: {
            query: {
                match: {
                    padre: {
                        query: req.params.id
                    }
                }
            },
            sort: {
                fechaCreacion: "asc"
            },
            size: 10000
        }
    }).then((json) => {
        const search = []
        json.body.hits.hits.forEach(hits => {
            search.push({ ...hits._source, id: hits._id })
        });
        res.send(search);
    }).catch((error) => {
        console.log(error);
        res.status(500)
        .send({
            code: 500,
            mensaje: error.name,
            error: 'INTERNAL_SERVER_ERROR'
        });
    });

});


/**
 * Busqueda 
 */
app.get('/comentario', validarAuth.authorization, function (req, res) {

    let query = {
        query: {
            bool: {
                must_not: {
                    exists: {
                        field: "padre"
                    }
                }
            }
        },
        sort: {
            fechaCreacion: "desc"
        }
    }

    if (req.query.q) {
        query = {
            query: {
                bool: {
                    must_not: {
                        exists: {
                            field: "padre"
                        }
                    },
                    must: {
                        match: {
                            texto: req.query.q
                        }
                    }
                }
            },
            sort: {
                fechaCreacion: "desc"
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
        console.log(error);
        res.status(500).send({
            code: 500,
            mensaje: error.name,
            error: 'INTERNAL_SERVER_ERROR'
        });
    });

});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});