import
  React,
{
  useEffect,
  useState
} from "react";
import { fromString } from 'uint8arrays'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { DID } from 'dids'
import { getResolver as getKeyResolver } from 'key-did-resolver'
import { compose, client } from "../utils/graphql"
import { gql } from '@apollo/client'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2'
import { faker } from '@faker-js/faker'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  plugins: {
    title: {
      display: true,
      text: 'Chart.js Bar Chart - Stacked',
    },
  },
  responsive: true,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
const testData = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
      backgroundColor: 'rgb(255, 99, 132)',
    },
    {
      label: 'Dataset 2',
      data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
      backgroundColor: 'rgb(75, 192, 192)',
    },
    {
      label: 'Dataset 3',
      data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
      backgroundColor: 'rgb(53, 162, 235)',
    },
  ],
};


type IntergrationMessageInfo = {
  id: string,
  date: string,
  from: string,
  type: string,
  message: string
}

const TimeSeries = () => {
  const [data, setData] = useState<Array<IntergrationMessageInfo>>()

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

    const intergrationMessageInfos = data?.data.integrationMessageIndex.edges.map((edge: Record<string, any>) => {
      return edge.node as IntergrationMessageInfo
    })

    setData(intergrationMessageInfos)
  }

  useEffect(() => {
    updateModel()
  }, [])

  return (
    <div>
      <div>Time Series</div>
      <div>{ JSON.stringify(data) }</div>
      <Bar options={options} data={testData} />
    </div>
  )
}

export default TimeSeries
