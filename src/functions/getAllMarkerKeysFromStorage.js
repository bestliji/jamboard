const faunadb = require("faunadb")
const query = faunadb.query

exports.handler = async function(inEvent, inContext, inCallback) {
  const documentID = inEvent.queryStringParameters.documentID
  const client = new faunadb.Client({
    secret: process.env.FAUNDB_SERVER_SECRET
  })
  await client.query(
    query.Paginate(query.Match(query.Ref("indexes/markers")))
  ).then(async inResponse => {
    const docRefs = inResponse.data
    let keys = docRefs.filter(inRef => inRef.id.startsWith(documentID))
    keys = keys.map(inRef => inRef.id)
    inCallback(null, { statusCode : 200, body : JSON.stringify(keys) })
  }).catch(inError => {
      return { statusCode : 400, body : JSON.stringify(inError)}
  })
}