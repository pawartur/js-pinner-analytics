import
  React,
{
  useEffect,
  useState
} from "react";
import { gql, useQuery } from '@apollo/client'
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
      text: 'Events by time and type',
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

const COLORS = [
  'rgb(255, 99, 132)',
  'rgb(75, 192, 192)',
  'rgb(53, 162, 235)',
  'rgb(153, 162, 235)',
  'rgb(153, 222, 235)',
  'rgb(153, 222, 135)',
]

const dateMap = {
  '2022-07-25': '25th Jul',
  '2022-07-26': '26th Jul',
  '2022-07-27': '27th Jul',
  '2022-07-28': '28th Jul',
  '2022-07-29': '29th Jul',
  '2022-07-30': '30th Jul',
  '2022-07-31': '31st Jul'
}

const labels = Object.values(dateMap)

type Dataset = {
  label: string
  data: Array<number>
  backgroundColor: string
}

type ChartData = {
  labels: Array<string>
  datasets: Array<Dataset>
}

const testData: ChartData = {
  labels,
  datasets: [
    {
      label: 'Tasks',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: 'rgb(255, 99, 132)',
    },
    {
      label: 'Pinned Messages',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: 'rgb(75, 192, 192)',
    },
    {
      label: 'Reminders',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: 'rgb(53, 162, 235)',
    },
  ],
}

type IntergrationMessageInfo = {
  id: string,
  date: string,
  from: string,
  type: string,
  message: string
}

const TimeSeries = () => {
  const { loading, error, data } = useQuery(
    gql(`
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
    `),
    {
      pollInterval: 5000
    }
  )
  const [chartData, setChartData] = useState<ChartData>()

  const reloadChart = async () => {
    if (data === undefined || data?.integrationMessageIndex.edges.length === 0) return
    const intergrationMessageInfos = data.integrationMessageIndex.edges.map((edge: Record<string, any>) => {
      return edge.node
    }) as Array<IntergrationMessageInfo>

    const dateLabels = Array.from(new Set(intergrationMessageInfos.map((info) => {
      const date = new Date(info.date)
      return `${date.getDate()} - ${date.getMonth() + 1} ${date.getHours()}:00 - ${date.getHours()}:59`
    }))).sort()
    const messageTypes = Array.from(new Set(intergrationMessageInfos.map((info: IntergrationMessageInfo) => {
      return info.type
    }))).sort()
    const chartData: ChartData = {
      labels: dateLabels,
      datasets: messageTypes.map((messageType: string, index) => {
        return {
          label: messageType,
          data: dateLabels.map(
            (dateLabel) => {
              return intergrationMessageInfos.filter((info) => {
                const date = new Date(info.date)
                return info.type === messageType && dateLabel.startsWith(`${date.getDate()} - ${date.getMonth() + 1} ${date.getHours()}:00`)
              }).length
            }
          ),
          backgroundColor: COLORS[index]
        }
      })
    }
    setChartData(chartData)
  }

  useEffect(() => {
    reloadChart()
  }, [data])

  if (loading || chartData === undefined) {
    return (
      <div>
        <label>Loading...</label>
      </div>
    )
  } else  if (error) {
    return (
      <div>
        <label>{error.message}</label>
      </div>
    )
  } else {
    return (
      <Bar options={options} data={chartData!} />
    )
  }
}

export default TimeSeries
