var _ = require("lodash");
var async = require("async");
const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();
var processed  = 0;
/**
 * Responds to any HTTP request that can provide a "message" field in the body.
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
exports.syncMailchimp = (req, res) => {
  if (req.method.toLowerCase() != 'post') {
    res.status(400).send('Use POST method');
    return;
  }
  var apikey = req.get('X-MC-KEY');
  if (!apikey) {
    res.status(403).send('No MC Key specified!');
    return;
  }

  var MailchimpApi = require('mailchimp-api-v3');
  var mailchimp = new MailchimpApi(apikey);

  var listId = "d8395a2829";
  var endpoint = "/lists/" + listId + "/members?count=1000";

  mailchimp.get(endpoint, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error calling MC');
      return;
    }
    console.log ("Retrieved from Mailchimp");

    var entities = [];
    var chunks = _.chunk(results.members, 20);
    console.log ("Chunk count: " + chunks.length);

    async.eachSeries(chunks, (chunk, acb) => {
      processed += chunk.length;
      console.log ("Processing chunk upto # "+ processed);
      processChunk(chunk, acb);
    }, (err)=>{
      if (err) res.status(500).send(err.message);
      else res.status(200).send('Stored members');

      return;
    })

    function processChunk(members, cb) {
      _.each(members, (member) => {
        console.log(member.id + " : " + member.email_address);
        const key = datastore.key(["Member", member.id]);
        delete member._links;
        if (member.merge_fields) {
          _.mapKeys(member.merge_fields, (value, key) => {
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
          return cb();
        })
        .catch((err) => {
          return cb(err);
        });

    }

  })
};



