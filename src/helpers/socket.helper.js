let logger = console;
const socket = {};
const { post, param } = require("../routes");
const socketService = require("../service/socket-service");
const chatService = require("../service/chat-service");
const environment = require("../environments/environment");
const jwt = require("jsonwebtoken");

socket.config = (server) => {
  const io = require("socket.io")(server, {
    transports: ["websocket", "polling"],
    cors: {
      origin: "*",
    },
  });
  socket.io = io;
  console.log("io");

  // io.use((socket, next) => {
  //   try {
  //     const { token } = socket.handshake.headers;

  //     if (!token) {
  //       console.log("Unauthorized Access via socket");
  //       const err = new Error("Unauthorized Access");
  //       return next(err);
  //     }
  //     let decoded = jwt.decode(token);

  //     jwt.verify(token, environment.JWT_SECRET_KEY, async (err, user) => {
  //       if (err) {
  //         console.log("Invalid or Expired Token in socket");
  //         const err = new Error("Invalid or Expired Token");
  //         return next(err);
  //       }
  //       socket.user = decoded;
  //       next();
  //     });
  //   } catch (error) {
  //     console.log("Socket Conn Error ==> ", error?.message);
  //     const err = new Error("Invalid or Expired Token");
  //     return next(err);
  //   }
  // });

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

    socket.on("create-new-post", async (params, cb) => {
      logger.info("Create new post", {
        method: "Create new post",
        params: params,
      });
      try {
        const data = await socketService.createPost(params);
        console.log(data);
        if (data?.posts) {
          io.emit("new-post-added", data?.posts);

          if (data?.notifications) {
            for (const key in data?.notifications) {
              if (Object.hasOwnProperty.call(data?.notifications, key)) {
                const notification = data?.notifications[key];

                io.to(`${notification.notificationToProfileId}`).emit(
                  "notification",
                  notification
                );
              }
            }
          }

          // const socketData = await socketService.getPost(params);
          // if (typeof cb === "function") cb(socketData);
          // socket.broadcast.emit("new-post", socketData);
        }
      } catch (error) {
        console.log(error);
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
          io.emit("likeOrDislike", data.posts);
          const notification = await socketService.createNotification({
            notificationToProfileId: params.toProfileId,
            postId: params.postId,
            notificationByProfileId: params.profileId,
            actionType: params.actionType,
          });
          console.log(notification);
          // notification - emit - to user
          io.to(`${notification.notificationToProfileId}`).emit(
            "notification",
            notification
          );
          // } else if (params.communityPostId) {
          //   const data = await socketService.likeFeedPost(params);
          //   socket.broadcast.emit("community-post", data);
          //   const notification = await socketService.createNotification({
          //     notificationToProfileId: params.toProfileId,
          //     postId: params.communityPostId,
          //     notificationByProfileId: params.profileId,
          //     actionType: params.actionType,
          //   });
          //   // notification - emit - to user
          //   io.to(`${notification.notificationToProfileId}`).emit(
          //     "notification",
          //     notification
          //   );
        }
      } else {
        if (params.postId) {
          const data = await socketService.disLikeFeedPost(params);
          // socket.broadcast.emit("new-post", data);
          io.emit("likeOrDislike", data.posts);
        }
        // else if (params.communityPostId) {
        //   const data = await socketService.disLikeFeedPost(params);
        //   socket.broadcast.emit("community-post", data);
        // }
      }
    });

    socket.on("send-notification", (params) => {
      console.log(params);

      logger.info("likeOrDislikeNotify", {
        method: "User like on post",
        params: params,
      });
    });

    socket.on("comments-on-post", async (params) => {
      console.log(params);
      const data = await socketService.createComments(params);
      if (data.comments) {
        console.log("comments-on-post====>", data?.comments);
        io.emit("comments-on-post", data?.comments);
      }
      if (data?.notifications) {
        for (const key in data?.notifications) {
          if (Object.hasOwnProperty.call(data?.notifications, key)) {
            const notification = data?.notifications[key];
            io.to(`${notification.notificationToProfileId}`).emit(
              "notification",
              notification
            );
          }
        }
      }
      logger.info("comments on post", {
        method: "User comment on post",
        params: params,
      });
    });

    socket.on("likeOrDislikeComments", async (params) => {
      logger.info("like", {
        method: "Like on post",
        params: params,
      });
      if (params.actionType) {
        const data = await socketService.likeFeedComment(params);
        console.log(data.comments);
        socket.broadcast.emit("likeOrDislikeComments", data.comments);
        const notification = await socketService.createNotification({
          notificationToProfileId: params.toProfileId,
          postId: params.postId,
          commentId: params.commentId,
          notificationByProfileId: params.profileId,
          actionType: params.actionType,
        });
        console.log(notification);
        // notification - emit - to user
        io.to(`${notification.notificationToProfileId}`).emit(
          "notification",
          notification
        );
      } else {
        const data = await socketService.disLikeFeedComment(params);
        socket.broadcast.emit("likeOrDislikeComments", data.comments);
      }
    });

    socket.on("deletePost", async (params) => {
      logger.info("like", {
        method: "delete post",
        params: params,
      });
      if (params.id) {
        const data = await socketService.deletePost(params);
        io.emit("deletePost", data);
      }
    });

    socket.on("isReadNotification", async (params) => {
      logger.info("like", {
        method: "read notification",
        params: params,
      });
      try {
        if (params.profileId) {
          params["isRead"] = "Y";
          io.to(`${params.profileId}`).emit("isReadNotification_ack", params);
        }
      } catch (error) {
        return error;
      }
    });

    socket.on("get-meta", async (params) => {
      logger.info("meta", {
        method: "get Meta",
        params: params,
      });
      if (params.url) {
        const data = await socketService.getMeta(params);
        if (data) {
          // console.log("meta-data", data);
          socket.emit("get-meta", data);
          // return data;
        }
      }
    });

    // Message Socket //
    socket.on("join-chat-room", async (params) => {
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

    socket.on("get-chat-list", async (params, cb) => {
      logger.info("get-chat", {
        ...params,
        address,
        id: socket.id,
        method: "get-chat",
      });
      try {
        if (params) {
          const chatList = await chatService.getChatList(params);
          if (cb) {
            // socket.emit("chat-list", chatList);
            return cb(chatList);
          } else {
            console.log("cb is not defined");
          }
        }
      } catch (error) {
        cb(error);
      }
    });

    socket.on("check-room", async (params, cb) => {
      logger.info("join", {
        ...params,
        address,
        id: socket.id,
        method: "join",
      });
      try {
        if (params) {
          const room = await chatService.checkRoomCreated(params);
          console.log(room);
          if (cb) {
            // socket.emit("chat-list", chatList);
            return cb(room);
          } else {
            console.log("cb is not defined");
          }
        }
      } catch (error) {
        cb(error);
      }
    });

    socket.on("create-room", async (params, cb) => {
      logger.info("join", {
        ...params,
        address,
        id: socket.id,
        method: "join",
      });
      try {
        if (params) {
          const data = await chatService.createChatRoom(params);
          console.log(data);
          if (data?.room) {
            // io.to(`${params.profileId2}`).emit("new-room", data.id);
            if (data?.notification) {
              if (data?.notification) {
                io.to(`${data.notification?.notificationToProfileId}`).emit(
                  "notification",
                  data?.notification
                );
              }
            }
            return cb({ room: data.room });
          } else {
            return cb({ message: "Room already created" });
          }
        }
      } catch (error) {
        cd(error);
      }
    });

    socket.on("send-message", async (params, cb) => {
      logger.info("send-message", {
        ...params,
        address,
        id: socket.id,
        method: "send-message",
      });
      try {
        if (params) {
          const data = await chatService.sendMessage(params);
          if (data.newMessage) {
            io.to(`${params.profileId}`).emit("new-message", data.newMessage);
            if (data?.notification) {
              if (data?.notification) {
                io.to(`${data.notification?.notificationToProfileId}`).emit(
                  "notification",
                  data?.notification
                );
              }
            }
            return cb(data.newMessage);
          }
        }
      } catch (error) {
        cb(error);
      }
    });

    socket.on("read-message", async (params, cb) => {
      logger.info("read-message", {
        ...params,
        address,
        id: socket.id,
        method: "read-message",
      });
      try {
        if (params) {
          const data = await chatService.readMessage(params);
          // io.to(params.profileId).emit("update-message", data.ids);
          if (data) {
            return cb(data.ids);
          }
        }
      } catch (error) {
        cb(error);
      }
    });

    socket.on("accept-room", async (params, cb) => {
      logger.info("read-message", {
        ...params,
        address,
        id: socket.id,
        method: "read-message",
      });
      try {
        if (params) {
          const data = await chatService.acceptRoom(params);
          console.log("accept-invitation", data);
          if (data) {
            io.to(`${data?.notification?.notificationToProfileId}`).emit(
              "notification",
              data?.notification
            );
            io.to(`${data?.notification?.notificationToProfileId}`).emit(
              "accept-invitation",
              data?.room
            );
            return cb(data?.room);
          }
        }
      } catch (error) {
        return cb(error);
      }
    });

    socket.on("edit-message", async (params, cb) => {
      logger.info("edit-message", {
        ...params,
        address,
        id: socket.id,
        method: "edit-message",
      });
      try {
        if (params) {
          const data = await chatService.editMessage(params);
          io.to(`${params?.profileId}`).emit("new-message", data);
          if (data) {
            return cb(data);
          }
        }
      } catch (error) {
        return cb(error);
      }
    });

    socket.on("delete-message", async (params, cb) => {
      logger.info("delete-message", {
        ...params,
        address,
        id: socket.id,
        method: "delete-message",
      });
      try {
        if (params) {
          const data = await chatService.deleteMessage(params);
          io.to(`${params?.profileId}`).emit("new-message", data);
          if (data) {
            return cb(data);
          }
        }
      } catch (error) {
        return cb(error);
      }
    });
  });
};

module.exports = socket;
