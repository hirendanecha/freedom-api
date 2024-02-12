const { executeQuery } = require("../helpers/utils");
const { notificationMailOnInvite } = require("../helpers/utils");

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

exports.editMessage = async function (data) {
  return await editMessage(data);
};

exports.deleteMessage = async function (data) {
  return await deleteMessage(data);
};

exports.deleteRoom = async function (data) {
  return await deleteRoom(data);
};

exports.startCall = async function (data) {
  return await startCall(data);
};

exports.declineCall = async function (data) {
  return await declineCall(data);
};

exports.pickUpCall = async function (data) {
  return await pickUpCall(data);
};

exports.createGroups = async function (data) {
  return await createGroups(data);
};

exports.getGroupList = async function (data) {
  return await getGroupList(data);
};

exports.getGroup = async function (data) {
  return await getGroup(data);
};

exports.removeMember = async function (data) {
  return await removeMember(data);
};

exports.getRoomsIds = async function (data) {
  return await getRoomsIds(data);
};

const getChatList = async function (params) {
  try {
    // const query = `select r.id as roomId,count(m.id) as unReadMessage ,r.profileId1 as createdBy, r.isAccepted,p.ID as profileId,p.Username,p.FirstName,p.lastName,p.ProfilePicName from chatRooms as r join profile as p on p.ID = CASE
    //               WHEN r.profileId1 = ${params.profileId} THEN r.profileId2
    //               WHEN r.profileId2 = ${params.profileId} THEN r.profileId1
    //               END left join messages as m on m.roomId = roomId and m.sentBy != ${params.profileId} and m.isRead = 'N' where r.profileId1 = ? or r.profileId2 = ? order by roomId`;
    const query = `SELECT
                  r.id AS roomId,
                  COUNT(CASE WHEN m.id IS NOT NULL THEN 1 END) AS unReadMessage,
                  r.profileId1 AS createdBy,
                  r.isAccepted,
                  r.lastMessageText,
                  r.updatedDate,
                  r.createdDate,
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
    r.id, r.profileId1, r.isAccepted,r.updatedDate, p.ID, p.Username, p.FirstName, p.LastName, p.ProfilePicName
ORDER BY
r.updatedDate desc;`;
    const values = [params.profileId, params.profileId];
    const chatList = await executeQuery(query, values);
//     const query1 = `SELECT g.id AS groupId,
//     g.profileId AS createdBy,
//     g.profileImage,
//     g.groupName,
//     g.createdDate,
//     g.lastMessageText,
//     g.updatedDate,
//     COUNT(CASE WHEN m.id IS NOT NULL THEN 1 END) AS unReadMessage,
//     p.Username,
//     p.ProfilePicName,
//     p.ID AS profileId
// FROM chatGroups AS g
// LEFT JOIN groupMembers AS gm ON gm.groupId = g.id
// LEFT JOIN profile AS p ON p.ID = g.profileId
// LEFT JOIN messages AS m ON m.groupId = g.id
//                        AND m.sentBy != ${params.profileId}
//                        AND m.isRead = 'N'
// WHERE gm.profileId = ${params.profileId}
// GROUP BY g.id
// ORDER BY g.updatedDate DESC`;
//     const groupList = await executeQuery(query1);
//     console.log("groupList===>", groupList);
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
    if (!oldRoom.length) {
      const query = "Insert Into chatRooms set ?";
      const values = [data];
      const room = await executeQuery(query, values);
      const notification = await createNotification({
        notificationToProfileId: data?.profileId2,
        roomId: room?.insertId,
        notificationByProfileId: data?.profileId1,
        actionType: "M",
        msg: "invited you to private chat",
      });
      const findUser = `select u.Email,p.FirstName,p.LastName,p.Username from users as u left join profile as p on p.UserID = u.Id where p.ID = ?`;
      const values1 = [notification.notificationToProfileId];
      const userData = await executeQuery(findUser, values1);
      const findSenderUser = `select p.ID,p.Username,p.FirstName,p.LastName from profile as p where p.ID = ?`;
      const values2 = [notification.notificationByProfileId];
      const senderData = await executeQuery(findSenderUser, values2);
      const userDetails = {
        email: userData[0].Email,
        profileId: senderData[0].ID,
        userName: userData[0].Username,
        senderUsername: senderData[0].Username,
        firstName: userData[0].FirstName,
        msg: `${senderData[0].Username} invited you to private chat`,
      };
      await notificationMailOnInvite(userDetails);
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
      roomId: params?.roomId,
      groupId: params?.groupId,
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

      const query1 =
        "select m.*,p.Username,p.ProfilePicName,p.FirstName from messages as m left join profile as p on p.ID = m.sentBy where m.id = ?";
      const values1 = message.insertId;
      const [newMessage] = await executeQuery(query1, values1);
      if (newMessage) {
        if (data.roomId) {
          const date = new Date();
          const query =
            "update chatRooms set lastMessageText = ?,updatedDate = ? where id = ?";
          const values = [data.messageText, date, data.roomId];
          const updatedRoom = await executeQuery(query, values);
          const notification = await createNotification({
            notificationToProfileId: params?.profileId,
            roomId: data?.roomId,
            notificationByProfileId: data?.sentBy,
            actionType: "M",
            msg: "sent you a message",
          });
          return { newMessage, notification };
        }
        if (data.groupId) {
          const date = new Date();
          const query =
            "update chatGroups set lastMessageText = ?,updatedDate = ? where id = ?";
          const values = [data.messageText, date, data.groupId];
          const updatedGroup = await executeQuery(query, values);
          const notification = await createNotification({
            notificationToProfileId: params.profileId,
            groupId: data?.groupId,
            notificationByProfileId: data?.sentBy,
            actionType: "M",
            msg: "sent you a message in group",
          });
          return { newMessage, notification };
        }
      }
      // let notifications = [];
      // if (params?.profileIds.length >= 0) {
      //   console.log("in===>");
      //   for (const key in params?.profileIds) {
      //     if (Object.hasOwnProperty.call(params?.profileIds, key)) {
      //       const id = params?.profileIds[key];
      //       const notification = await createNotification({
      //         notificationByProfileId: data?.sentBy,
      //         notificationToProfileId: id,
      //         groupId: params?.groupId,
      //         roomId: params?.roomId,
      //         actionType: "M",
      //         msg: "sent you a message",
      //       });
      //       notifications.push(notification);
      //     }
      //   }
      //   // return { newMessage, notifications };
      // }
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
      groupId,
      notificationByProfileId,
      actionType,
      msg,
    } = params;
    const query =
      "SELECT ID,ProfilePicName, Username, FirstName,LastName from profile where ID = ?";
    const values = [notificationByProfileId];
    const userData = await executeQuery(query, values);
    let desc = `${userData[0]?.Username || userData[0]?.FirstName} ${msg}`;

    const data = {
      notificationToProfileId: notificationToProfileId || null,
      roomId: roomId || null,
      groupId: groupId || null,
      notificationByProfileId: notificationByProfileId || null,
      actionType: actionType,
      notificationDesc: desc,
    };
    if (data.notificationByProfileId !== data.notificationToProfileId) {
      const query1 = "insert into notifications set ?";
      const values1 = [data];
      const notificationData = await executeQuery(query1, values1);
      return { ...data, id: notificationData.insertId };
      // return true;
    }
    // else {
    //   // const find =
    //   //   "select * from notifications where roomId= ? and notificationByProfileId = ?";
    //   // const value = [data.roomId, data.notificationByProfileId];
    //   // const oldData = await executeQuery(find, value);
    //   // if (oldData.length) {
    //   //   return oldData[0];
    //   // } else {
    //   // }
    //   const query1 = "insert into notifications set ?";
    //   const values1 = [data];
    //   const notificationData = await executeQuery(query1, values1);
    //   return { ...data, id: notificationData.insertId };
    // }
  } catch (error) {
    return error;
  }
};

const acceptRoom = async function (params) {
  try {
    const date = new Date();
    const query = `update chatRooms set isAccepted = 'Y',updatedDate = ${date} where id = ? and profileId2 =?`;
    const values = [params.roomId, params.profileId];
    const updatedRoom = await executeQuery(query, values);
    const room = await getRoom(params.roomId);
    let notification = {};
    if (room) {
      notification = await createNotification({
        notificationToProfileId: room?.createdBy,
        roomId: room?.roomId,
        notificationByProfileId: room?.profileId,
        actionType: "M",
        msg: `has accepted your messaging invite`,
      });
    }
    const findUser = `select u.Email,p.FirstName,p.LastName,p.Username from users as u left join profile as p on p.UserID = u.Id where p.ID = ?`;
    const values1 = [notification.notificationToProfileId];
    const userData = await executeQuery(findUser, values1);
    const findSenderUser = `select p.ID,p.Username,p.FirstName,p.LastName from profile as p where p.ID = ?`;
    const values2 = [notification.notificationByProfileId];
    const senderData = await executeQuery(findSenderUser, values2);
    const userDetails = {
      email: userData[0].Email,
      profileId: senderData[0].ID,
      userName: userData[0].Username,
      senderUsername: senderData[0].Username,
      firstName: userData[0].FirstName,
      msg: `${senderData[0].Username} has accepted your messaging invite`,
    };
    await notificationMailOnInvite(userDetails);

    return { room, notification };
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

const editMessage = async function (params) {
  try {
    const data = {
      id: params.id,
      messageText: params.messageText,
      roomId: params?.roomId,
      groupId: params?.groupId,
      sentBy: params.sentBy,
      messageMedia: params.messageMedia,
    };
    const query = "update messages set ? where id = ?";
    const values = [data, data.id];
    const message = await executeQuery(query, values);
    if (data.roomId) {
      const date = new Date();
      const query =
        "update chatRooms set lastMessageText = ?,updatedDate = ? where id = ?";
      const values = [data.messageText, date, data.roomId];
      const updatedRoom = await executeQuery(query, values);
    }
    if (data.groupId) {
      const date = new Date();
      const query =
        "update chatGroups set lastMessageText = ?,updatedDate = ? where id = ?";
      const values = [data.messageText, date, data.groupId];
      const updatedGroup = await executeQuery(query, values);
    }
    const query1 = "select * from messages where id = ?";
    const values1 = [data?.id];
    const [editMessage] = await executeQuery(query1, values1);
    return editMessage;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const deleteMessage = async function (params) {
  try {
    let data = {
      id: params.id,
      roomId: params?.roomId,
      groupId: params?.groupId,
      sentBy: params.sentBy,
    };
    const query = "delete from messages where id = ?";
    const values = [data.id];
    const message = await executeQuery(query, values);
    console.log("message", message);
    if (message) {
      let messageList = [];
      if (data?.roomId) {
        const query =
          "select * from messages where roomId = ? order by createdDate desc limit 1";
        const values = data.roomId;
        [messageList] = await executeQuery(query, values);
        if (messageList) {
          const query1 = `update chatRooms set lastMessageText = ?,updatedDate = ? where id = ?`;
          const values1 = [
            messageList?.messageText || null,
            messageList.createdDate,
            data.roomId,
          ];
          const updatedRoom = await executeQuery(query1, values1);
          console.log("updateRoom->", updatedRoom);
          data.isDeleted = true;
          return data;
        }
      }
      if (data?.groupId) {
        const query =
          "select * from messages where groupId = ? order by createdDate desc limit 1";
        const values = data.groupId;
        [messageList] = await executeQuery(query, values);
        if (messageList) {
          const query1 = `update chatGroups set lastMessageText = ?,updatedDate = ? where id = ?`;
          const values1 = [
            messageList?.messageText || null,
            messageList.createdDate,
            data.groupId,
          ];
          const updatedRoom = await executeQuery(query1, values1);
          console.log("updateRoom->", updatedRoom);
          data.isDeleted = true;
          return data;
        }
      }
      console.log("messageList", messageList);
    }
    console.log("return");
  } catch (error) {
    return error;
  }
};

const deleteRoom = async function (params) {
  try {
    const data = {
      id: params.id,
    };
    const query = "delete from chatRooms where id = ?";
    const values = [data.id];
    const message = await executeQuery(query, values);

    // const query1 = "select * from messages where roomId = ?";
    // const values1 = data.roomId;
    // const messageList = await executeQuery(query1, values1);.0
    data.isDeleted = true;
    return data;
  } catch (error) {
    return error;
  }
};

// const startCall = async function (params) {
//   try {
//     if (params) {
//       // const data = {
//       //   // notificationToProfileId: params?.notificationToProfileId,
//       //   roomId: params?.roomId,
//       //   groupId: params?.groupId,
//       //   notificationByProfileId: params?.notificationByProfileId,
//       //   actionType: "VC",
//       //   msg: "incoming call...",
//       // };
//       let notifications = [];
//       if (params.notificationToProfileIds.length >= 0) {
//         for (const key in params.notificationToProfileIds) {
//           if (
//             Object.hasOwnProperty.call(params.notificationToProfileIds, key)
//           ) {
//             const id = params.notificationToProfileIds[key];
//             const notification = await createNotification({
//               notificationByProfileId: params?.notificationByProfileId,
//               notificationToProfileId: id,
//               actionType: "VC",
//               groupId: params?.groupId,
//               roomId: params?.roomId,
//               msg: "incoming call...",
//             });
//             notification["link"] = params?.link;
//             const query = `select p.Username,p.FirstName,p.LastName,p.ProfilePicName from profile as p where p.ID = ${params?.notificationByProfileId}`;
//             const [profile] = await executeQuery(query);
//             notification["Username"] = profile?.Username;
//             notification["ProfilePicName"] = profile?.ProfilePicName;
//             notifications.push(notification);
//           }
//         }
//         return { notifications };
//       }
//     }
//   } catch (error) {
//     return error;
//   }
// };

const startCall = async function (params) {
  try {
    if (params) {
      if (params?.roomId) {
        const data = {
          notificationToProfileId: params?.notificationToProfileId || null,
          roomId: params?.roomId,
          notificationByProfileId: params?.notificationByProfileId || null,
          actionType: "VC",
          msg: "incoming call...",
        };
        const notification = await createNotification(data);
        notification["link"] = params?.link;
        const query = `select p.Username,p.FirstName,p.LastName,p.ProfilePicName from profile as p where p.ID = ${params?.notificationByProfileId}`;
        const [profile] = await executeQuery(query);
        notification["Username"] = profile?.Username;
        notification["ProfilePicName"] = profile?.ProfilePicName;
        return { notification };
      } else {
        const data = {
          notificationToProfileId: params?.notificationToProfileId || null,
          groupId: params?.groupId,
          notificationByProfileId: params?.notificationByProfileId || null,
          actionType: "VC",
          msg: "incoming call...",
        };
        const notification = await createNotification(data);
        notification["link"] = params?.link;
        const query = `select p.Username,p.FirstName,p.LastName,p.ProfilePicName from profile as p where p.ID = ${params?.notificationByProfileId}`;
        const [profile] = await executeQuery(query);
        notification["Username"] = profile?.Username;
        notification["ProfilePicName"] = profile?.ProfilePicName;
        return { notification };
      }
    }
  } catch (error) {
    return error;
  }
};

const declineCall = async function (params) {
  try {
    if (params) {
      const data = {
        notificationToProfileId: params?.notificationToProfileId || null,
        roomId: params?.roomId,
        notificationByProfileId: params?.notificationByProfileId || null,
        actionType: "DC",
        msg: "Decline call..",
      };
      const notification = await createNotification(data);
      return notification;
    }
  } catch (error) {
    return error;
  }
};

const pickUpCall = async function (params) {
  try {
    if (params) {
      const data = {
        notificationToProfileId: params?.notificationToProfileId || null,
        roomId: params?.roomId,
        groupId: params?.groupId,
        notificationByProfileId: params?.notificationByProfileId || null,
        actionType: "SC",
        msg: "call start...",
      };
      const notification = await createNotification(data);
      notification["link"] = params?.link;
      return notification;
    }
  } catch (error) {
    return error;
  }
};

const createGroups = async function (params) {
  try {
    if (params) {
      const data = {
        profileId: params?.profileId,
        groupName: params?.groupName,
        profileImage: params?.profileImage,
      };
      if (!params?.groupId) {
        const query = "insert into chatGroups set ?";
        const values = [data];
        const group = await executeQuery(query, values);
        params["groupId"] = group?.insertId;
        const adminData = {
          groupId: group.insertId,
          profileId: data.profileId,
          isAdmin: "Y",
        };
        await addMembers(adminData);
      }
      if (params?.groupId) {
        const data = {
          groupName: params.groupName,
          profileImage: params.profileImage,
          updatedDate: new Date(),
        };
        const query = "update chatGroups set ? where id = ?";
        const values = [data, params?.groupId];
        const updateGroup = await executeQuery(query, values);
      }
      let notifications = [];
      let groupList = {};
      if (params.profileIds.length > 0) {
        for (const id of params.profileIds) {
          const data = {
            groupId: params?.groupId,
            profileId: id,
          };
          const memberId = await addMembers(data);
          if (memberId) {
            console.log("ids==>", id);
            const notification = await createNotification({
              notificationByProfileId: params?.profileId,
              notificationToProfileId: id,
              actionType: "M",
              groupId: params?.groupId,
              msg: `added you in chat group`,
            });
            notifications.push(notification);
          }
        }
      } else {
        groupList = await getGroup(params);
        console.log("getttt===>");
        return { groupList };
      }
      groupList = await getGroup(params);
      return { notifications, groupList };
    }
  } catch (error) {
    return error;
  }
};

const addMembers = async function (data) {
  try {
    const query = "insert into groupMembers set ?";
    const values = [data];
    const member = await executeQuery(query, values);
    console.log(member.insertId);
    return member.insertId;
  } catch (error) {
    return error;
  }
};

const getGroup = async function (params) {
  try {
    const query =
      "select g.*,count(gm.profileId) as members from chatGroups as g left join profile as p on p.ID = g.profileId left join groupMembers as gm on gm.groupId = g.id where g.id=?";
    const values = [params?.groupId];
    const [groups] = await executeQuery(query, values);
    if (groups.id) {
      const getMembersQuery =
        "select gm.*,p.Username, p.ProfilePicName,p.FirstName,p.LastName from groupMembers as gm left join profile as p on p.ID = gm.profileId where gm.groupId = ?;";
      const members = await executeQuery(getMembersQuery, [groups?.id]);
      groups["memberList"] = members;
    }
    return groups;
  } catch (error) {
    return error;
  }
};

const getGroupList = async function (params) {
  try {
    const query = `SELECT g.id AS groupId,
                g.profileId AS createdBy,
                g.profileImage,
                g.groupName,
                g.createdDate,
                g.lastMessageText,
                g.updatedDate,
                COUNT(CASE WHEN m.id IS NOT NULL THEN 1 END) AS unReadMessage,
                p.Username,
                p.ProfilePicName,
                p.ID AS profileId
            FROM chatGroups AS g
            LEFT JOIN groupMembers AS gm ON gm.groupId = g.id
            LEFT JOIN profile AS p ON p.ID = g.profileId
            LEFT JOIN messages AS m ON m.groupId = g.id
                                   AND m.sentBy != ?
                                   AND m.isRead = 'N'
            WHERE gm.profileId = ?
            GROUP BY g.id
            ORDER BY g.updatedDate DESC`;
    const values = [params.profileId, params.profileId];
    const groupsList = await executeQuery(query, values);
    return groupsList;
  } catch (error) {
    return error;
  }
};

const removeMember = async function (params) {
  try {
    const query =
      "delete from groupMembers where profileId = ? and groupId = ?";
    const values = [params.profileId, params.groupId];
    const member = await executeQuery(query, values);
    const group = await getGroup(params);
    return group;
  } catch (error) {
    return error;
  }
};

const getRoomsIds = async function (id) {
  try {
    const query = `select id as roomId from chatRooms where profileId1 = ${id} or profileId2 = ${id}`;
    const query1 = `select groupId from groupMembers where profileId = ${id}`;
    const roomsIds = await executeQuery(query);
    const groupsIds = await executeQuery(query1);

    const chatData = { roomsIds, groupsIds };
    return chatData;
  } catch (error) {
    return error;
  }
};
