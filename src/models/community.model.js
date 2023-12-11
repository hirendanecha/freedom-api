var db = require("../../config/db.config");
require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var Community = function (community) {
  this.profileId = community.profileId;
  this.communityName = community.CommunityName;
  this.slug = community.slug;
  this.communityDescription = community.CommunityDescription;
  this.logoImg = community.logoImg;
  this.coverImg = community.coverImg;
  this.isApprove = community.isApprove || "N";
  this.pageType = community?.pageType;
  this.Country = community?.Country;
  this.City = community?.City;
  this.State = community?.State;
  this.Zip = community?.Zip;
  this.County = community?.County;
};

Community.findAllCommunity = async function (
  limit,
  offset,
  search,
  pageType,
  startDate,
  endDate
) {
  let whereCondition = `c.pageType = '${pageType}' ${
    search ? `AND c.CommunityName LIKE '%${search}%'` : ""
  }`;
  if (startDate && endDate) {
    whereCondition += `AND c.creationDate >= '${startDate}' AND c.creationDate <= '${endDate}'`;
    console.log(whereCondition);
  } else if (startDate) {
    whereCondition += `AND c.creationDate >= '${startDate}'`;
  } else if (endDate) {
    whereCondition += `AND c.creationDate <= '${endDate}'`;
  }
  const searchCount = await executeQuery(
    `SELECT count(c.Id) as count FROM community as c WHERE ${whereCondition}`
  );
  const searchData = await executeQuery(
    `select c.*,count(cm.profileId) as members,c.Country,c.City,c.State,c.Zip,c.County from community as c left join communityMembers as cm on cm.communityId = c.Id left join profile as p on p.ID = c.profileId where ${whereCondition} GROUP BY c.Id order by c.creationDate desc limit ? offset ?`,
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

Community.findUnApproveCommunity = async function (
  limit,
  offset,
  search,
  pageType
) {
  const whereCondition = `c.pageType = '${pageType}' AND c.CommunityName LIKE '%${search}%'`;
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

Community.create = async function (communityData, result) {
  console.log(communityData);
  db.query("INSERT INTO community set ?", communityData, function (err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res.insertId);
    }
  });
};

Community.CreateAdvertizementLink = async function (communityLinkData, result) {
  console.log(communityLinkData);
  db.query(
    "INSERT INTO advertizement_Link set ?",
    communityLinkData,
    function (err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res.insertId);
      }
    }
  );
};

Community.editAdvertizeMentLink = async function (communityLinkData) {
  const query = "update advertizement_Link set ? where communityId =?";
  const values = [communityLinkData, communityLinkData.communityId];
  const updateLink = await executeQuery(query, values);
  return updateLink;
};

Community.edit = async function (communityData, Id) {
  const query = "update community set ? where Id = ?";
  const values = [communityData, Id];
  const community = await executeQuery(query, values);
  return community;
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

Community.getLink = function (id, result) {
  db.query(
    "select * from advertizement_Link where communityId=?",
    id,
    function (err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

Community.leaveFromCommunity = function (profileId, communityId, result) {
  db.query(
    "delete from communityMembers where profileId=? and communityId=?",
    [profileId, communityId],
    function (err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

Community.findCommunityById = async function (id) {
  const query1 =
    "select c.*,p.Username,count(cm.profileId) as members from community as c left join profile as p on p.ID = c.profileId left join communityMembers as cm on cm.communityId = c.Id where c.Id=?;";
  const query2 =
    "select cm.*,p.Username, p.ProfilePicName,p.FirstName,p.LastName,p.Zip,p.Country,p.State,p.City,p.MobileNo,p.CoverPicName,u.Email,p.UserID from communityMembers as cm left join profile as p on p.ID = cm.profileId left join users as u on u.Id = p.UserID  where cm.communityId = ?;";
  const values = [id];
  const community = await executeQuery(query1, values);
  const members = await executeQuery(query2, values);
  community.map((e) => {
    e.memberList = members;
    return e;
  });
  return community;
};

Community.findCommunityBySlug = async function (slug) {
  const communityQuery =
    "select c.*,p.Username, count(cm.profileId) as members from community as c left join profile as p on p.ID = c.profileId left join communityMembers as cm on cm.communityId = c.Id where c.slug=?";
  const communities = await executeQuery(communityQuery, [slug]);
  const community = communities?.[0] || {};

  if (community?.Id) {
    const getMembersQuery =
      "select cm.*,p.Username, p.ProfilePicName,p.FirstName,p.LastName from communityMembers as cm left join profile as p on p.ID = cm.profileId where cm.communityId = ?;";
    const members = await executeQuery(getMembersQuery, [community?.Id]);
    community["memberList"] = members;
  }

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

Community.createCommunityAdminByMA = async function (data) {
  const query =
    "select * from communityMembers where profileId = ? and communityId= ?";
  const values = [data.profileId, data.communityId];
  const member = await executeQuery(query, values);
  if (member.length) {
    const query =
      "update communityMembers set isAdmin=? where profileId =? and communityId = ?";
    const values = [data.isAdmin, data.profileId, data.communityId];
    const member = await executeQuery(query, values);
  } else {
    const query = "insert into communityMembers set ?";
    const values = [data];
    const member = await executeQuery(query, values);
  }
};

Community.getLocalCommunities = async function (id) {
  const query =
    // "select * from community where profileId = ? and isApprove = 'Y' order by creationDate desc limit 3";
    `SELECT c.* FROM community AS c LEFT JOIN communityMembers AS cm ON cm.communityId = c.Id WHERE c.isApprove = 'Y' AND cm.profileId = ? GROUP BY c.Id limit 3`;
  const communities = await executeQuery(query, [id]);
  return communities;
};

Community.getCommunity = async function (id, pageType) {
  console.log("get==>", id, pageType);
  const query1 = "select communityId from communityMembers where profileId = ?";
  const communityId = await executeQuery(query1, [id]);
  const ids = communityId.map((ele) => Number(ele.communityId)).join(",");
  let query = "";
  // if (ids) {
  //   query = `select c.*,count(cm.profileId) as members from community as c left join communityMembers as cm on cm.communityId = c.Id where c.isApprove = 'Y' AND c.pageType = '${pageType}' AND cm.profileId != ? group by c.Id order by c.Id desc;`;
  // } else {
  //   query = `select c.*,count(cm.profileId) as members from community as c left join communityMembers as cm on cm.communityId = c.Id where c.isApprove = 'Y' AND c.pageType = '${pageType}' AND cm.profileId != ? group by c.Id order by c.Id desc;`;
  // }
  query = `select c.* from community as c where c.isApprove = 'Y' AND c.pageType = '${pageType}' group by c.Id order by c.Id desc;`;
  // const communityList = await executeQuery(query, [id]);
  const communityList = await executeQuery(query);
  console.log(communityList);
  const localCommunities = [];
  for (const key in communityList) {
    const query1 =
      "select cm.profileId from communityMembers as cm where cm.communityId = ?;";
    if (Object.hasOwnProperty.call(communityList, key)) {
      const community = communityList[key];
      const memberList = [];
      const values1 = [community.Id];
      const members = await executeQuery(query1, values1);
      members.map((e) => {
        memberList?.push(e.profileId);
      });
      community.memberList = memberList;
      community.members = members.length;
      localCommunities.push(community);
    }
  }
  return localCommunities;
};

Community.getCommunityByUserId = async function (id, pageType) {
  const query =
    "select c.*,count(cm.profileId) as members from community as c left join communityMembers as cm on cm.communityId = c.Id where c.pageType = ? AND c.profileId =? group by c.Id;";
  const values = [pageType, id];
  const communityList = await executeQuery(query, values);
  console.log(communityList);
  return communityList;
};

Community.getJoinedCommunityByProfileId = async function (id, pageType) {
  const query = `SELECT 
  c.*
  FROM
  community AS c
      LEFT JOIN
  communityMembers AS cm ON cm.communityId = c.Id and cm.profileId != c.profileId
  WHERE
  c.isApprove = 'Y'
  AND c.pageType = '${pageType}'
      AND cm.profileId = ?
  GROUP BY c.Id`;
  const values = [id];
  const communityList = await executeQuery(query, values);
  const joinedCommunityList = [];
  for (const key in communityList) {
    const query1 =
      "select count(cm.profileId) as members from communityMembers as cm where communityId = ?";
    if (Object.hasOwnProperty.call(communityList, key)) {
      const community = communityList[key];
      const values1 = [community.Id];
      const members = await executeQuery(query1, values1);
      community.members = members[0].members;
      console.log(community);
      joinedCommunityList.push(community);
    }
  }
  return joinedCommunityList;
};
module.exports = Community;
