var _ = require("lodash");
var async = require("async");
const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

/**
 * Responds to any HTTP request that can provide a "message" field in the body.
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
exports.syncMailchimp = (req, res) => {
  if (req.method.toLowerCase() != 'post'){
    res.status(400).send('Use POST method');
    return;
  }
  var apikey = req.get('X-MC-KEY');
  if (!apikey){
    res.status(403).send('No MC Key specified!');
    return;
  }

var MailchimpApi = require('mailchimp-api-v3');
var mailchimp = new MailchimpApi(apikey);

var listId = "d8395a2829";
var endpoint = "/lists/" + listId +"/members";
mailchimp.get(endpoint,(err,results)=>{
  if (err) {
    console.log(err);
    res.status(500).send('Error calling MC');
    return;
  }

  var entities = [];

  _.each (results.members, (member) => {
    console.log (member.id + " : " + member.email_address);
    const key = datastore.key(["Member", member.id]);
    delete member._links;
    if (member.merge_fields && member.merge_fields.properties) {
      _.mapKeys(member.merge_fields.properties, (value, key)=>{
        member[key] = value;
      })
    }
    // delete member.merge_fields;

    const entity = {
      key: key,
      data: member
    };
  
    entities.push(entity)
  });

  return datastore.upsert(entities)
  .then(() => {
    res.status(200).send('Stored members');
  })
  .catch((err) => {
    res.status(500).send(err.message);
  });
})


};

