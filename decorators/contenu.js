const fp = require("fastify-plugin");
module.exports = fp((fastify, opts, done) => {
  fastify.decorate("contenu", {
    appIsReady: async () => {
      let collection = fastify.mongo.db.collection("users");
      if ((await collection.countDocuments()) == 0) {
        return false;
      }
      return true;
    },
  });
  done();
});
