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

  async.eachSeries (results.members, (member, acb) => {
    console.log (member.id + " : " + member.email_address);
    save(member, (err)=>{
      if (err) {
        return acb(err);
      }
    })
  }, (err)=>{
    if (err) res.status(500).send(err.message);
    else res.status(200).send('Stored members');
    return;
  })
  // res.status(200).send(JSON.stringify(results, null, 2));
})


};

function save (member, cb) {
  const key = datastore.key(["Member", member.id]);
  const entity = {
    key: key,
    data: member
  };
  return datastore.save(entity)
  .then(() => {
    console.log(`Entity ${key.path.join('/')} saved.`);
    return cb();
  })
  .catch((err) => {
    console.error(err);
    return cb(err);
  });


}