const { executeQuery } = require("../helpers/utils");
const { notificationMail } = require("../helpers/utils");
const socketService = require("./socket-service");

exports.getChatList = async function (params) {
  return await getChatList(params);
};

exports.checkRoomCreated = async function (params) {
  return await checkRoomCreated(params);
};

exports.createChatRoom = async function (params) {
  return await createChatRoom(params);
};

exports.sendMessage = async function (params) {
  return await sendMessage(params);
};

exports.readMessage = async function (params) {
  return await readMessage(params);
};

exports.acceptRoom = async function (params) {
  return await acceptRoom(params);
};

exports.createNotification = async function (data) {
  return await createNotification(data);
};

const getChatList = async function (params) {
  try {
    // const query = `select r.id as roomId,count(m.id) as unReadMessage ,r.profileId1 as createdBy, r.isAccepted,p.ID as profileId,p.Username,p.FirstName,p.lastName,p.ProfilePicName from chatRooms as r join profile as p on p.ID = CASE
    //               WHEN r.profileId1 = ${params.profileId} THEN r.profileId2
    //               WHEN r.profileId2 = ${params.profileId} THEN r.profileId1
    //               END left join messages as m on m.roomId = roomId and m.sentBy != ${params.profileId} and m.isRead = 'N' where r.profileId1 = ? or r.profileId2 = ? order by roomId`;
    const query = `SELECT
                  r.id AS roomId,
                  COUNT(m.id) AS unReadMessage,
                  r.profileId1 AS createdBy,
                  r.isAccepted,
                  p.ID AS profileId,
                  p.Username,
                  p.FirstName,
                  p.LastName,
                  p.ProfilePicName
FROM
    chatRooms AS r
JOIN
    profile AS p ON p.ID = CASE
        WHEN r.profileId1 = ${params.profileId} THEN r.profileId2
        WHEN r.profileId2 = ${params.profileId} THEN r.profileId1
    END
LEFT JOIN
    messages AS m ON m.roomId = r.id AND m.sentBy != ${params.profileId} AND m.isRead = 'N'
WHERE
    r.profileId1 = ? OR r.profileId2 = ?
GROUP BY
    r.id, r.profileId1, r.isAccepted, p.ID, p.Username, p.FirstName, p.LastName, p.ProfilePicName
ORDER BY
    r.id desc;`;
    const values = [params.profileId, params.profileId];
    const chatList = await executeQuery(query, values);
    console.log(chatList);
    return chatList;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const checkRoomCreated = async function (params) {
  try {
    const query =
      "select r.* from chatRooms as r where (r.profileId1 = ? and r.profileId2 = ?) or (r.profileId2 = ? and r.profileId1 = ?) ";
    const values = [
      params.profileId1,
      params.profileId2,
      params.profileId1,
      params.profileId2,
    ];
    const room = await executeQuery(query, values);
    return room;
  } catch (error) {
    return error;
  }
};

const createChatRoom = async function (params) {
  try {
    const data = {
      profileId1: params?.profileId1,
      profileId2: params?.profileId2,
    };
    const query =
      "select * from chatRooms as r where (r.profileId1 = ? and r.profileId2 = ?) or (r.profileId2 = ? and r.profileId1 = ?)";
    const values = [
      data.profileId1,
      data.profileId2,
      data.profileId1,
      data.profileId2,
    ];
    const oldRoom = await executeQuery(query, values);
    console.log(oldRoom);
    if (!oldRoom.length) {
      const query = "Insert Into chatRooms set ?";
      const values = [data];
      const room = await executeQuery(query, values);
      console.log(room.insertId);
      const notification = await createNotification({
        notificationToProfileId: data?.profileId2,
        roomId: room?.insertId,
        notificationByProfileId: data?.profileId1,
        actionType: "M",
        msg: "invite you in chat",
      });
      const newRoom = await getRoom(room.insertId);
      return { room: newRoom, notification };
    } else {
      return null;
    }
  } catch (error) {
    return error;
  }
};

const sendMessage = async function (params) {
  try {
    const data = {
      messageText: params.messageText,
      roomId: params.roomId,
      sentBy: params.sentBy,
      messageMedia: params.messageMedia,
    };
    const query = "select * from chatRooms where id = ?";
    const values = [data.roomId];
    const oldRoom = await executeQuery(query, values);
    if (oldRoom) {
      const query = "Insert Into messages set ?";
      const values = [data];
      const message = await executeQuery(query, values);

      const query1 = "select * from messages where id = ?";
      const values1 = message.insertId;
      const [newMessage] = await executeQuery(query1, values1);
      const notification = await createNotification({
        notificationToProfileId: params?.profileId,
        roomId: data?.roomId,
        notificationByProfileId: data?.sentBy,
        actionType: "M",
        msg: "sent you a message",
      });
      return { newMessage, notification };
    } else {
      return false;
    }
  } catch (error) {
    return error;
  }
};

const readMessage = async function (params) {
  try {
    const query = "update messages set isRead = 'Y' where id in (?)";
    const values = [params.ids];
    const messages = await executeQuery(query, values);
    if (messages) {
      return params.ids;
    }
  } catch (error) {
    return error;
  }
};

const createNotification = async function (params) {
  try {
    const {
      notificationToProfileId,
      roomId,
      notificationByProfileId,
      actionType,
      msg,
    } = params;
    const query =
      "SELECT ID,ProfilePicName, Username, FirstName,LastName from profile where ID = ?";
    const values = [notificationByProfileId];
    const userData = await executeQuery(query, values);
    let desc = `${userData[0]?.Username || userData[0]?.FirstName} ${msg}`;
    console.log("desc===>", desc);

    const data = {
      notificationToProfileId: Number(notificationToProfileId),
      roomId: roomId,
      notificationByProfileId: Number(notificationByProfileId),
      actionType: actionType,
      notificationDesc: desc,
    };
    if (data.notificationByProfileId === data.notificationToProfileId) {
      return true;
    } else {
      const find =
        "select * from notifications where roomId= ? and notificationByProfileId = ?";
      const value = [data.roomId, data.notificationByProfileId];
      const oldData = await executeQuery(find, value);
      // if (oldData.length) {
      //   return oldData[0];
      // } else {
      // }
      const query1 = "insert into notifications set ?";
      const values1 = [data];
      const notificationData = await executeQuery(query1, values1);
      return { ...data, id: notificationData.insertId };
    }
  } catch (error) {
    return error;
  }
};

const acceptRoom = async function (params) {
  try {
    const query =
      "update chatRooms set isAccepted = 'Y' where id = ? and profileId2 =?";
    const values = [params.roomId, params.profileId];
    const updatedRoom = await executeQuery(query, values);
    console.log(updatedRoom);
    const room = await getRoom(params.roomId);
    return room;
    // if (updatedRoom) {
    // }
  } catch (error) {
    return error;
  }
};

const getRoom = async function (id) {
  try {
    const query =
      "select r.id as roomId,r.profileId1 as createdBy, r.isAccepted,p.ID as profileId,p.Username,p.FirstName,p.lastName,p.ProfilePicName from chatRooms as r join profile as p on p.ID = r.profileId2 where r.id = ?";
    const values = [id];
    const [room] = await executeQuery(query, values);
    if (room) {
      return room;
    }
  } catch (error) {
    return error;
  }
};
