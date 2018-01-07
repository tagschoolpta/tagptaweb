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
mailchimp.get('/lists',(results)=>{
  res.status(200).send(JSON.stringify(results));
})


};

function save (data) {

}