import
  React,
{
  useContext,
  useEffect,
  useState
} from "react";
import { fromString } from 'uint8arrays'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { DID } from 'dids'
import { getResolver as getKeyResolver } from 'key-did-resolver'
import { compose, client } from "../utils/graphql";
import { gql } from '@apollo/client'

type DataModel = Record<string, any>

const TimeSeries = () => {
  const [data, setData] = useState<DataModel>()

  const updateModel = async () => {
    // Authenticate with hard-coded private key
    const resolverRegistry = getKeyResolver()
    const seed = fromString('fd4078045500411b4e1c70f289770822df7ecbb7cf4a13bfa6e9c88013fa5361', 'base16')
    const provider = new Ed25519Provider(seed)
    const did = new DID({ provider: provider, resolver: resolverRegistry })
    compose.setDID(did)

    // Fetch the data
    const query = `
    query {
      integrationMessageIndex(first:1000) {
        edges {
          node {
            id
            date
            from
            type
            message
          }
        }
      }
    }
    `
    const data = await client.query({
      query: gql(query)
    })
    setData(data)
  }

  useEffect(() => {
    updateModel()
  }, [])

  return (
    <div>
      <div>Time Series</div>
      <div>{ JSON.stringify(data) }</div>
    </div>
  )
}

export default TimeSeries
