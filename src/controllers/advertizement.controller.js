const Advertizement = require("../models/advertizement.model");

exports.addEditAdvertizement = function (req, res) {
  try {
    const advertizement = new Advertizement(req.body);
    Advertizement.addEditAdvertisement(advertizement)
      .then((data) => {
        res.send({ data });
      })
      .catch((error) => {
        res.send(error);
      });
  } catch (error) {
    res.send(error);
  }
};

exports.getAdvertizementList = function (req, res) {
  try {
    Advertizement.getAdvertizementList()
      .then((data) => {
        res.status(200).send(data);
      })
      .catch((error) => {
        res.status(401).send(error);
      });
  } catch (error) {
    res.status(500).send(error);
  }
};
