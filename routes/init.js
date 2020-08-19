module.exports = async function (fastify, opts) {
  fastify.get("/init", async function (request, reply) {
    if (!(await this.contenu.appIsReady())) {
      return reply.send(
        this.httpResponse(405, {
          error: "true",
          message: "You need to setup the app",
        })
      );
    }
    return reply.send({
      ok: true,
    });
  });
};
