

import { useEffect, useRef } from "react"

const ReportChart = ({  timeRange }) => {
  const chartRef = useRef(null)

  // Mock data for different report types and time ranges
  const chartData = {
    revenue: {
      weekly: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [1200, 1900, 1500, 2100, 2400, 3100, 2800]
      },
      monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: [8500, 9200, 11500, 10800, 12500, 13200, 12800, 14500, 13800, 15200, 14800, 16500]
      },
      yearly: {
        labels: ['2019', '2020', '2021', '2022', '2023'],
        values: [95000, 105000, 125000, 142000, 165000]
      }
    },
    vehicles: {
      weekly: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [5, 8, 6, 9, 12, 15, 10]
      },
      monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: [18, 22, 25, 20, 28, 30, 26, 32, 28, 35, 30, 38]
      },
      yearly: {
        labels: ['2019', '2020', '2021', '2022', '2023'],
        values: [180, 210, 245, 280, 320]
      }
    },
    passengers: {
      weekly: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [120, 150, 135, 180, 190, 210, 200]
      },
      monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: [850, 920, 980, 910, 1050, 1120, 1080, 1150, 1100, 1200, 1180, 1250]
      },
      yearly: {
        labels: ['2019', '2020', '2021', '2022', '2023'],
        values: [9500, 8200, 10500, 11800, 12500]
      }
    },
    tax: {
      weekly: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [180, 285, 225, 315, 360, 465, 420]
      },
      monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: [1275, 1380, 1725, 1620, 1875, 1980, 1920, 2175, 2070, 2 , 'Oct', 'Nov', 'Dec'],
        values: [1275, 1380, 1725, 1620, 1875, 1980, 1920, 2175, 2070, 2280, 2220, 2475]
      },
      yearly: {
        labels: ['2019', '2020', '2021', '2022', '2023'],
        values: [14250, 15750, 18750, 21300, 24750]
      }
    }
  }

  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext("2d")

    // Clear previous chart
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height)

    const data = chartData[timeRange]
    const width = chartRef.current.width
    const height = chartRef.current.height
    const padding = 60
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Find max value for scaling
    const maxValue = Math.max(...data.values) * 1.1

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#e9ecef"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw grid lines
    const gridCount = 5
    for (let i = 0; i <= gridCount; i++) {
      const y = height - padding - (i / gridCount) * chartHeight

      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.strokeStyle = "rgba(233, 236, 239, 0.5)"
      ctx.stroke()

      // Draw y-axis labels
      ctx.font = "12px Arial"
      ctx.fillStyle = "#6c757d"
      ctx.textAlign = "right"

      const value = (maxValue * i) / gridCount
      let valueText = ""

      if (reportType === "revenue" || reportType === "tax") {
        valueText = "$" + value.toLocaleString()
      } else {
        valueText = value.toLocaleString()
      }

      ctx.fillText(valueText, padding - 10, y + 4)
    }

    // Draw x-axis labels
    ctx.font = "12px Arial"
    ctx.fillStyle = "#6c757d"
    ctx.textAlign = "center"

    const barWidth = (chartWidth / data.labels.length) * 0.6

    data.labels.forEach((label, i) => {
      const x = padding + (i + 0.5) * (chartWidth / data.labels.length)
      ctx.fillText(label, x, height - padding + 20)
    })

    // Set color based on report type
    let barColor
    switch (reportType) {
      case "revenue":
        barColor = "rgba(58, 134, 255, 0.7)"
        break
      case "vehicles":
        barColor = "rgba(131, 56, 236, 0.7)"
        break
      case "passengers":
        barColor = "rgba(255, 0, 110, 0.7)"
        break
      case "tax":
        barColor = "rgba(40, 167, 69, 0.7)"
        break
      default:
        barColor = "rgba(58, 134, 255, 0.7)"
    }

    // Draw bars
    data.values.forEach((value, i) => {
      const barHeight = (value / maxValue) * chartHeight
      const x = padding + (i + 0.5) * (chartWidth / data.labels.length) - barWidth / 2
      const y = height - padding - barHeight

      ctx.fillStyle = barColor
      ctx.fillRect(x, y, barWidth, barHeight)

      // Add value on top of bar
      ctx.font = "12px Arial"
      ctx.fillStyle = "#333"
      ctx.textAlign = "center"

      let valueText = ""
      if (reportType === "revenue" || reportType === "tax") {
        valueText = "$" + value.toLocaleString()
      } else {
        valueText = value.toLocaleString()
      }

      ctx.fillText(valueText, x + barWidth / 2, y - 5)
    })

    // Draw title
    ctx.font = "bold 16px Arial"
    ctx.fillStyle = "#333"
    ctx.textAlign = "center"

    let title = ""
    switch (reportType) {
      case "revenue":
        title = "Revenue Report"
        break
      case "vehicles":
        title = "Vehicle Registrations"
        break
      case "passengers":
        title = "Passenger Count"
        break
      case "tax":
        title = "Tax Collection"
        break
      default:
        title = "Report"
    }

    title += ` (${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})`

    ctx.fillText(title, width / 2, padding / 2)
  }, [reportType, timeRange])

  return <canvas ref={chartRef} width={800} height={400} style={{ width: "100%", height: "100%" }}></canvas>
}

export default ReportChart

