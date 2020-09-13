module.exports = async function(fastify, opts) {
  const multer = require("fastify-multer");
  fastify.register(multer.contentParser);
  const crypto = require("crypto");
  const path = require("path");
  const GridFsStorage = require("multer-gridfs-storage");

  const storage = new GridFsStorage({
    db: fastify.mongo.db,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString("hex") + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: "fs",
          };
          resolve(fileInfo);
        });
      });
    },
  });

  const upload = multer({
    storage,
  });
  const GridFSBucket = require("mongodb").GridFSBucket;
  let gfs = new GridFSBucket(fastify.mongo.db, {
    bucketName: "fs",
  });

  fastify.get("/files/:filename", {
    handler: function(request, reply) {
      return gfs
        .find({
          filename: request.params.filename,
        })
        .toArray(async (err, files) => {
          if (!files || files.length === 0) {
            reply.status(404).send({
              err: "no files exist",
            });
          }
          if (request.query.download == 1) reply.send(gfs.openDownloadStream(files[0]._id));
          else reply.header("Content-Type", files[0].contentType).send(gfs.openDownloadStream(files[0]._id));
        });
    },
  });

  fastify.post("/remove/:filename", {
    preHandler: (req) => {
      return req.jwtVerify();
    },
    schema: {
      params: {
        type: "object",
        required: ["filename"],
        properties: {
          filename: {
            type: "string",
            minLength: 1,
          },
        },
      },
    },
    handler: function(request, reply) {
      return gfs
        .find({
          filename: request.params.filename,
        })
        .toArray((err, files) => {
          if (!files || files.length === 0) {
            return reply.status(404).send({
              err: "no files exist",
            });
          }
          gfs.delete(files[0]._id);
          return reply.send({ ok: true });
        });
    },
  });

  fastify.post("/upload", {
    preHandler: [
      (req) => {
        return req.jwtVerify();
      },
      upload.single("file"),
    ],
    handler: async function(request, reply) {
      //   this.upload.single("file");
      reply.send({
        ok: true,
        file: {
          filename: request.file.filename,
          id: request.file.id,
          url: "/api/files/" + request.file.filename,
        },
      });
    },
  });
};
