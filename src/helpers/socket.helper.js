let logger = console;
const socket = {};
const { post, param } = require("../routes");
const socketService = require("../service/socket-service");

socket.config = (server) => {
  const io = require("socket.io")(server, {
    transports: ["websocket", "polling"],
    cors: {
      origin: "*",
    },
  });
  socket.io = io;
  console.log("io");

  io.sockets.on("connection", (socket) => {
    let address = socket.request.connection.remoteAddress;

    logger.info(`New Connection`, {
      address,
      id: socket.id,
    });
    socket.on("leave", (params) => {
      logger.info("leaved", {
        ...params,
        address,
        id: socket.id,
        method: "leave",
      });
      socket.leave(params.room);
    });

    socket.on("join", async (params) => {
      socket.join(params.room, {
        ...params,
      });
      logger.info("join", {
        ...params,
        address,
        id: socket.id,
        method: "join",
      });
    });

    socket.on("disconnect", () => {
      logger.info("disconnected", {
        id: socket.id,
        method: "disconnect",
      });
    });

    socket.on("rooms", (params, cb) => {
      logger.info("Rooms", {
        id: socket.id,
        method: "rooms",
        type: typeof cb,
        params: params,
      });

      if (typeof cb === "function")
        cb({
          rooms: ["DSDsds"],
        });
    });

    // socket for post //
    socket.on("get-new-post", async (params) => {
      console.log(params);

      logger.info("New post found", {
        method: "New post found",
        params: params,
      });
      const data = await socketService.getPost(params);
      if (data) {
        socket.emit("new-post", data);
      }
    });

    socket.on("create-new-post", async (params) => {
      logger.info("Create new post", {
        method: "Create new post",
        params: params,
      });
      const post = await socketService.createPost(params);
      console.log(post);
      if (post) {
        socket.emit("create-new-post", post);
        const data = await socketService.getPost(params);
        socket.broadcast.emit("new-post", data);
      }
    });

    // socket for community //
    socket.on("create-new-community", async (params) => {
      logger.info("Create new community", {
        method: "Create new community",
        params: params,
      });
      const community = await socketService.createCommunity(params);
      if (community) {
        socket.emit("create-new-community", community);
        const communityList = await socketService.getUnApproveCommunity(params);
        socket.broadcast.emit("get-unApprove-community", communityList);
      }
    });

    socket.on("create-community-post", async (params) => {
      logger.info("Create community post", {
        method: "Create community post",
        params: params,
      });
      const post = await socketService.createCommunityPost(params);
      console.log(post);
      if (post) {
        socket.emit("create-community-post", post);
        const data = await socketService.getCommunityPost(params);
        if (data) {
          socket.broadcast.emit("community-post", data);
        }
      }
      // socket.broadcast.emit("get-community-post", { ...params });
    });

    socket.on("get-community-post", async (params) => {
      console.log(params);

      logger.info("New post found", {
        method: "New post found",
        params: params,
      });
      const data = await socketService.getCommunityPost(params);
      if (data) {
        console.log("posts", data);
        socket.emit("community-post", data);
      }
    });

    socket.on("get-new-community", async (params) => {
      console.log(params);

      logger.info("New community found", {
        method: "New community found",
        params: params,
      });
      console.log(params);
      const communityList = await socketService.getCommunity(params);
      if (communityList) {
        socket.emit("new-community", communityList);
      }
    });

    //socket for admin //
    socket.on("get-unApprove-community", async (params) => {
      console.log(params);

      logger.info("New community found", {
        method: "New community found",
        params: params,
      });
      const communityList = await socketService.getUnApproveCommunity(params);
      if (communityList) {
        console.log(communityList);
        socket.emit("get-unApprove-community", communityList);
      }
    });

    socket.on("get-Approve-community", async (params) => {
      console.log(params);

      logger.info("New community found", {
        method: "New community found",
        params: params,
      });
      const communityList = await socketService.getApproveCommunity(params);
      if (communityList) {
        console.log(communityList);
        socket.emit("get-Approve-community", communityList);
      }
    });

    socket.on("likeOrDislike", async (params) => {
      logger.info("like", {
        method: "Like on post",
        params: params,
      });
      if (params.actionType) {
        if (params.postId) {
          const data = await socketService.likeFeedPost(params);
          socket.broadcast.emit("new-post", data);
        } else if (params.communityPostId) {
          const data = await socketService.likeFeedPost(params);
          socket.broadcast.emit("community-post", data);
        }
      } else {
        if (params.postId) {
          const data = await socketService.disLikeFeedPost(params);
          socket.broadcast.emit("new-post", data);
        } else if (params.communityPostId) {
          const data = await socketService.disLikeFeedPost(params);
          socket.broadcast.emit("community-post", data);
        }
      }
    });

    socket.on("likeOrDislikeNotify", (params) => {
      console.log(params);

      logger.info("likeOrDislikeNotify", {
        method: "User like on post",
        params: params,
      });
    });
  });
};

module.exports = socket;
