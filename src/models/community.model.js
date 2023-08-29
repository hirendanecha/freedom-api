var db = require("../../config/db.config");
require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var Community = function (community) {
  this.profileId = community.profileId;
  this.communityName = community.CommunityName;
  this.communityDescription = community.CommunityDescription;
  this.logoImg = community.logoImg;
  this.coverImg = community.coverImg;
  this.isApprove = community.isApprove || "N";
  this.creationDate = new Date();
};

Community.findApproveCommunity = async function (limit, offset, search) {
  const whereCondition = `c.CommunityName LIKE '%${search}%'`;
  const searchCount = await executeQuery(
    `SELECT count(c.Id) as count FROM community as c WHERE ${whereCondition}`
  );
  const searchData = await executeQuery(
    `select c.*,count(cm.profileId) as members from community as c left join communityMembers as cm on cm.communityId = c.Id where c.isApprove='Y' and ${whereCondition} GROUP BY c.Id order by c.creationDate desc limit ? offset ?`,
    [limit, offset]
  );
  return {
    count: searchCount?.[0]?.count || 0,
    data: searchData,
  };
  // db.query(
  //   "select c.*,count(cm.profileId) as members from community as c left join communityMembers as cm on cm.communityId = c.Id where c.isApprove='Y' GROUP BY c.Id order by c.creationDate desc limit ? offset ?",
  //   [limit, offset],
  //   function (err, res) {
  //     if (err) {
  //       result(err, null);
  //     } else {
  //       result(null, res);
  //     }
  //   }
  // );
};

Community.findUnApproveCommunity = async function (limit, offset, search) {
  const whereCondition = `c.CommunityName LIKE '%${search}%'`;
  const searchCount = await executeQuery(
    `SELECT count(c.Id) as count FROM community as c WHERE ${whereCondition}`
  );
  const searchData = await executeQuery(
    `select c.*,count(cm.profileId) as members from community as c left join communityMembers as cm on cm.communityId = c.Id where c.isApprove='N' and ${whereCondition} GROUP BY c.Id order by c.creationDate desc limit ? offset ?`,
    [limit, offset]
  );
  return {
    count: searchCount?.[0]?.count || 0,
    data: searchData,
  };
};

Community.create = function (communityData, result) {
  db.query("INSERT INTO community set ?", communityData, function (err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res.insertId);
    }
  });
};

Community.approveCommunity = function (communityId, isApprove, result) {
  db.query(
    "UPDATE community SET isApprove=? where Id=?",
    [isApprove, communityId],
    function (err, res) {
      if (err) {
        console.log(err);
        result(err, null);
      } else {
        console.log(res);
        result(null, res);
      }
    }
  );
};

Community.deleteCommunity = function (id, result) {
  db.query("delete from community where Id=?", id, function (err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Community.findCommunityById = async function (id, result) {
  const query1 =
    "select c.*,p.Username,count(cm.profileId) as members from community as c left join profile as p on p.ID = c.profileId left join communityMembers as cm on cm.communityId = c.Id where c.Id=?;";
  const query2 =
    "select cm.*,p.Username, p.ProfilePicName,p.FirstName,p.LastName from communityMembers as cm left join profile as p on p.ID = cm.profileId where cm.communityId = ?;";
  const values = [id];
  const community = await executeQuery(query1, values);
  const members = await executeQuery(query2, values);
  community.map((e) => {
    e.memberList = members;
    return e;
  });
  return community;
};

Community.search = async function (searchText, limit, offset) {
  // const { searchText } = query;
  if (searchText) {
    const query = `select * from community WHERE CommunityName LIKE ? limit ? offset ?`;
    const values = [`%${searchText}%`, limit, offset];
    const searchData = await executeQuery(query, values);
    return searchData;
  } else {
    // const query = `select *  from ${type}`;
    // const searchData = await executeQuery(query);
    // return searchData;
    return { error: "data not found" };
  }
  // } else {
  //   return { error: "error" };
  // }
};

Community.joinCommunity = async function (data, result) {
  console.log(data);
  db.query("insert into communityMembers set ?", data, function (err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res.insertId);
    }
  });
};

Community.createCommunityAdmin = async function (isAdmin, id, result) {
  db.query(
    "update communityMembers set isAdmin=? where Id =?",
    [isAdmin, id],
    function (err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

Community.getCommunity = async function (id) {
  const query =
    "select c.*,count(cm.profileId) as members from community as c left join communityMembers as cm on cm.communityId = c.Id where c.isApprove = 'Y' AND cm.profileId != ? group by c.Id;";
  const communityList = await executeQuery(query, [id]);
  return communityList;
};

Community.getCommunityByUserId = async function (id) {
  const query =
    "select c.*,count(cm.profileId) as members from community as c left join communityMembers as cm on cm.communityId = c.Id where c.isApprove = 'Y' AND c.profileId =? group by c.Id;";
  const values = id;
  const communityList = await executeQuery(query, values);
  console.log(communityList);
  return communityList;
};
module.exports = Community;
