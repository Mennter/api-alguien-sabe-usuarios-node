const Stream = function () {
    var self = this;

    self.connections = {};

    self.enable = function () {
        return function (req, res, next) {
            res.sseSetup = function () {
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    "Access-Control-Allow-Origin": "*"
                })
            }

            res.sseSend = function (id, event, data) {

                if(req.params.id !== data['padre']) return;

                var stream = 
                    "id: " + String(id) + "\n" +
                    "event: " + String(event) + "\n" +
                    "data: " + JSON.stringify(data) +
                    "\n\n";

                // console.log(id, event, data, stream);

                res.write(stream);
            }

            next()
        }
    }

    self.add = function (request, response) {
        response.sseSetup();
        var ip = String(request.ip);
        self.connections[ip] = response;
    }.bind(self);

    self.push_sse = function (id, type, obj) {
        Object.keys(self.connections).forEach(function (key) {
            self.connections[key].sseSend(id, type, obj);
        });
    }.bind(self);

}

module.exports = Stream;
