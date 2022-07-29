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
import { Button } from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const getOptions = (groupBy: string) => {
  return {
    plugins: {
      title: {
        display: true,
        text: `Events by time and ${groupBy}`,
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
}

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
  const [groupBy, setGroupBy] = useState<string>('Source')

  const reloadChart = async () => {
    if (data === undefined || data?.integrationMessageIndex.edges.length === 0) return
    const intergrationMessageInfos = data.integrationMessageIndex.edges.map((edge: Record<string, any>) => {
      return edge.node as IntergrationMessageInfo
    }).sort((left: IntergrationMessageInfo, right: IntergrationMessageInfo) => {
      const leftDate = new Date(left.date)
      const rightDate = new Date(right.date)
      return leftDate < rightDate
    }) as Array<IntergrationMessageInfo>

    const firstDate = new Date(intergrationMessageInfos[0].date)
    const lastDate = new Date(intergrationMessageInfos[intergrationMessageInfos.length - 1].date)

    const dateLabels = new Array<string>()
    dateLabels.push(`${firstDate.getDate()} - ${firstDate.getMonth() + 1} ${firstDate.getHours()}:00 - ${firstDate.getHours()}:59`)
    let currentDate = firstDate
    while(currentDate.getTime() < lastDate.getTime()) {
      currentDate = new Date(currentDate.getTime() + 3600000)
      dateLabels.push(`${currentDate.getDate()} - ${currentDate.getMonth() + 1} ${currentDate.getHours()}:00 - ${currentDate.getHours()}:59`)
    }
    const groups = Array.from(new Set(intergrationMessageInfos.map((info: IntergrationMessageInfo) => {
      if (groupBy === 'Source') {
        return info.from.split(":")[0]
      } else {
        return info.type
      }
    }))).sort()
    const chartData: ChartData = {
      labels: dateLabels,
      datasets: groups.map((group: string, index) => {
        return {
          label: group,
          data: dateLabels.map(
            (dateLabel) => {
              return intergrationMessageInfos.filter((info) => {
                const date = new Date(info.date)
                if (groupBy === 'Source') {
                  return info.from === group && dateLabel.startsWith(`${date.getDate()} - ${date.getMonth() + 1} ${date.getHours()}:00`)
                } else {
                  return info.type === group && dateLabel.startsWith(`${date.getDate()} - ${date.getMonth() + 1} ${date.getHours()}:00`)
                }
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
  }, [data, groupBy])

  if (loading) {
    return (
      <div>
        <label>Loading...</label>
      </div>
    )
  } else if (chartData === undefined) {
    return (
      <div>
        <label>No data</label>
      </div>
    )
  } else  if (error) {
    return (
      <div>
        <label>{error.message}</label>
      </div>
    )
  } else {
    const containerStyle = {
      width: '100%',
      height: '100%'
    };

    return (
      <div style={containerStyle}>
        <div>
          <label>Group by: </label>
          <Button variant="outlined" onClick={() => {
            setGroupBy('Source')
          }}>Source</Button>
          <Button variant="outlined" onClick={() => {
            setGroupBy('Type')
          }}>Type</Button>
        </div>
        <Bar options={getOptions(groupBy)} data={chartData!} />
      </div>
    )
  }
}

export default TimeSeries
