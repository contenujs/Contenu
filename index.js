require("dotenv").config();

const fastify = require("fastify")({ logger: process.env.DEBUG });
const autoload = require("fastify-autoload");
const path = require("path");
const fastifyStatic = require("fastify-static");

//register plugins
fastify
  .register(require("fastify-jwt"), {
    secret: process.env.SECRET_KEY,
    expiresIn: process.env.JWT_EXPIRE_DAYS || "30d",
  })
  .register(require("fastify-cors"))
  .register(require("fastify-mongodb"), {
    forceClose: true,
    url: process.env.MONGODB_CONNECTION,
  })
  .register(fastifyStatic, {
    root: path.join(__dirname, "./front/"),
  })
  .register(fastifyStatic, {
    root: path.join(__dirname, "./front/static/"),
    prefix: "/static/",
    decorateReply: false,
  });

//register functions
fastify.register(autoload, {
  dir: path.join(__dirname, "decorators"),
});

//register routes
fastify.register(autoload, {
  dir: path.join(__dirname, "routes"),
  options: { prefix: "/api" },
});

fastify.get("/:uid", async (request, reply) => {
  return reply.sendFile("./index.html");
});

fastify.listen(8080, "0.0.0.0", function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});
