
const credentials = {
  "name": "projects/tag-school-pta/locations/global/keyRings/master/cryptoKeys/secrets/cryptoKeyVersions/1",
  "ciphertext": "CiQA6894rxeOpmdknSmMt+Gn2RwexEYQJbvxDWwOkj2qRWJ0PmQSwAEALrBm8uyHgK4V1KohwELZkUAOCE4zeUh+6dpTv1D/49UgNH3iL7oi4VCEAi5zOheLYvJAf697o1hc2M0XtQA7TEWo+DBOzMsLovPpS0K0c4a9IaX09RRPPVcRElxwA6itUW3ZC8jDq431dQo4C5H4DzHQQsZhh7NrcufgS8FD0seA//jvxJu/caTaPQ5eD8frxo6uFlyOe81cu/U/Rs9axPOcV5tXQFaU0jp2stz0Gb0Z/BII17ieQ3JwP9nSYbE="
}

function buildAndAuthorizeService(callback) {
  // Imports the Google APIs client library
  const google = require('googleapis');
  const cloudkms = google.cloudkms({
    version: 'v1',
    auth: authClient
  });

  callback(null, cloudkms);
  // // Acquires credentials
  // google.auth.getApplicationDefault((err, authClient) => {
  //   if (err) {
  //     callback(err);
  //     return;
  //   }

  //   if (authClient.createScopedRequired && authClient.createScopedRequired()) {
  //     authClient = authClient.createScoped([
  //       'https://www.googleapis.com/auth/cloud-platform'
  //     ]);
  //   }

  //   // Instantiates an authorized client
  //   const cloudkms = google.cloudkms({
  //     version: 'v1',
  //     auth: authClient
  //   });

  //   callback(null, cloudkms);
  // });
}

/**
 * Responds to any HTTP request that can provide a "message" field in the body.
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
exports.loadMailchimp = (req, res) => {
  buildAndAuthorizeService((err, cloudkms) => {
    if (err) {
      console.log(err);
      res.status(400).send('Error receiving Cloud KMS');
      return;
    }
  
    const request = credentials;

    // Encrypts the file using the specified crypto key
    cloudkms.projects.locations.keyRings.cryptoKeys.decrypt(request, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send('Error Decrypting Credentials');
        return;
      }
      res.status(200).send(result);
    });
  });
};