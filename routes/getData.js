module.exports = async function(fastify, opts) {
  fastify.get("/data", {
    schema: {
      query: {
        type: "object",
        required: ["key"],
        properties: {
          key: {
            type: "string",
          },
        },
      },
    },
    handler: async function(request, reply) {
      if (!request.jwtVerified) {
        const collection = this.mongo.db.collection("content");
        const data = await collection.findOne(
          {
            key: request.query.key,
          },
          { key: 0, created_at: 0, updated_at: 0 }
        );
        return { key: request.query.key, content: data ? orderData(data.content) : {} };
      } else {
        const collection = this.mongo.db.collection("content");
        const data = await collection.findOne(
          {
            key: request.query.key,
          },
          { key: 0 }
        );
        return { key: request.query.key, content: data ? data.content : {} };
      }
    },
  });
  let orderData = (data) => {
    let result = {};
    for (let key of Object.keys(data)) {
      if (key !== "created_at" && key !== "upated_at") {
        if (typeof data[key].__value === "object") {
          result[key] = orderData(data[key].__value);
        } else {
          result[key] = data[key].__value;
        }
      }
    }
    return result;
  };
};
