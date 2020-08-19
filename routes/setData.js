module.exports = async function(fastify, opts) {
  fastify.post("/data", {
    preHandler: async (req) => {
      return await req.jwtVerify();
    },
    schema: {
      body: {
        type: "object",
        required: ["key", "content"],
        properties: {
          key: {
            type: "string",
          },
          content: {
            type: "object",
          },
        },
      },
    },
    handler: async function(request, reply) {
      let lastData = await this.mongo.db.collection("content").findOne({ key: request.body.key });
      if (!lastData) {
        // insert fields
        this.mongo.db.collection("content").insertOne({
          key: request.body.key,
          content: orderData({}, request.body.content),
        });
        return reply.send({
          ok: true,
        });
      } else {
        // update fields
        let data = orderData(lastData.content, request.body.content);
        this.mongo.db.collection("content").updateOne(
          {
            key: request.body.key,
          },
          {
            $set: { content: data },
          }
        );
        return reply.send(data);
      }
    },
  });
  let orderData = (lastData, data) => {
    let date = new Date(Date.now()).toISOString();
    for (let key of Object.keys(data)) {
      if (typeof lastData[key] === "undefined") {
        lastData[key] = {};
        lastData[key].created_at = date;
      }
      lastData[key].updated_at = date;
      if (typeof data[key] === "object") {
        if (typeof lastData[key].__value === "undefined") lastData[key].__value = {};
        if (typeof data[key].__value === "undefined") {
          lastData[key].__value = orderData(lastData[key].__value, data[key]);
        } else {
          lastData[key].__value = data[key].__value;
          if (data[key].__type) lastData[key].__type = data[key].__type;
        }
      } else {
        lastData[key] = data[key];
      }
    }
    return lastData;
  };
};
