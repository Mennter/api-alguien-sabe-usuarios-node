const jwt = require('jsonwebtoken');
const config = require('../config');


const authorization = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token && token.includes('Bearer ')) {
        const t = token.substring(7).toString()
        jwt.verify(t, config.key, function(err, decoded)  {
            if (err) {
                return res.status(401).json({ code: 401, mensaje: 'Token inválido', error: 'UNAUTHORIZED' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res
        .status(401)
        .send({
            code: 401,
            mensaje: 'Token no proveída.',
            error: 'UNAUTHORIZED'
        });
    }
}

module.exports = {
    authorization
}