const Validator = require('validatorjs');
Validator.useLang('es');


const comentario = (req, res, next) => {

    let rules = {
        texto: 'required',
        'autor.id': 'required',
        'autor.usuario': 'required'
    };

    
    let validation = new Validator(req.body, rules);

    if (validation.passes()) {
        next();
    } else {
        for (const key in rules) {
            if (validation.errors.first(key)) {
                res.send({
                    code: 400,
                    mensaje: validation.errors.first(key),
                    error: 'BAD_REQUEST'
                });
                break;
            }
        }

    }
}

module.exports = {
    comentario
}