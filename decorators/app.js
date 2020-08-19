const fp = require("fastify-plugin");
const httpResponse = require("http-errors");

module.exports = fp((fastify, opts, done) => {
  fastify.decorate("httpResponse", httpResponse);
  fastify.addHook("onRequest", async (request, reply) => {
    let jwtVerify = false;
    try {
      await request.jwtVerify();
      jwtVerify = true;
    } catch (err) {
      jwtVerify = false;
    }
    request.jwtVerified = jwtVerify;
  });
  done();
});
