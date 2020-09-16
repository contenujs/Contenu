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
          if (data[key].__type) {
            if ((lastData[key].__type === "image" && lastData[key].__value != data[key].__value) || (lastData[key].__type === "image" && data[key].__type != "image")) {
              deleteFile(lastData[key].__value);
            }
            lastData[key].__value = data[key].__value;
            lastData[key].__type = data[key].__type;
          }
        }
      } else {
        lastData[key] = data[key];
      }
    }
    return lastData;
  };
  const GridFSBucket = require("mongodb").GridFSBucket;
  let gfs = new GridFSBucket(fastify.mongo.db, {
    bucketName: "fs",
  });
  let deleteFile = (filename) => {
    try {
      return gfs
        .find({
          filename: filename,
        })
        .toArray((err, files) => {
          if (!files || files.length === 0) {
            return false;
          }
          gfs.delete(files[0]._id);
          return true;
        });
    } catch (err) {}
  };
};
