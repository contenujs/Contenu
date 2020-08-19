module.exports = async function (fastify, opts) {
  const bcrypt = require("bcryptjs");

  fastify.post("/auth", {
    schema: {
      body: {
        type: "object",
        required: ["type", "password"],
        properties: {
          type: {
            type: "string",
            enum: ["login", "register", "reset_password"],
          },
          password: {
            type: "string",
            minLength: 6,
          },
          currentPassword: {
            type: "string",
          },
        },
      },
    },
    handler: async function (request, reply) {
      if (request.body.type == "login") {
        if (!(await this.contenu.appIsReady())) {
          return appReadyException(reply, "You need to setup the app");
        }
        // check user login here
        const user = await this.mongo.db.collection("users").findOne();
        let compare = bcrypt.compareSync(request.body.password, user.password);
        if (compare) {
          const token = await reply.jwtSign({});
          reply.send({
            ok: true,
            token,
          });
        } else {
          return reply.send(
            fastify.httpResponse(401, {
              error: "true",
              message: "Password does not match",
            })
          );
        }
        // ===============================================
      } else if (request.body.type == "register") {
        if (await this.contenu.appIsReady()) {
          return appReadyException(reply, "App is configured before");
        }
        // check user register here
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(request.body.password, salt);

        await this.mongo.db.collection("users").insertOne({
          username: "admin",
          password: hash,
          created_at: new Date(Date.now()).toISOString(),
          updated_at: new Date(Date.now()).toISOString(),
        });
        reply.send({
          ok: true,
          message: "App is ready to management",
        });
        // ===============================================
      } else if (request.body.type == "reset_password") {
        if (!(await this.contenu.appIsReady())) {
          return appReadyException(reply, "You need to setup the app");
        }
        if (typeof (await request.body.currentPassword) === "undefined") {
          return appReadyException(reply, "currentPassword field is not set");
        }
        // check user reset password here
        const user = await this.mongo.db.collection("users").findOne();
        let compare = bcrypt.compareSync(request.body.currentPassword, user.password);
        if (compare) {
          var salt = bcrypt.genSaltSync(10);
          var hash = bcrypt.hashSync(request.body.password, salt);
          await this.mongo.db.collection("users").updateOne(
            { _id: user._id },
            {
              $set: { password: hash, updated_at: new Date(Date.now()).toISOString() },
            }
          );
          reply.send({
            ok: true,
            message: "password changed successfully",
          });
        } else {
          return reply.send(
            fastify.httpResponse(401, {
              error: "true",
              message: "Password does not match",
            })
          );
        }
      }
    },
  });

  let appReadyException = (reply, message) => {
    return reply.send(
      fastify.httpResponse(405, {
        error: "true",
        message: message,
      })
    );
  };
};
