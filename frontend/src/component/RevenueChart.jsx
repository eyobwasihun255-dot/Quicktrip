import { useEffect, useRef, useMemo } from "react";

const RevenueChart = ({ timeRange, payments }) => {
  const chartRef = useRef(null);

  // Group payments by time range
  const chartData = useMemo(() => {
    const groupedData = {
      labels: [],
      revenue: [],
      expenses: []
    };

    // Helper function to format dates
    const formatDate = (date, range) => {
      const d = new Date(date);
      switch(range) {
        case 'daily':
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case 'weekly':
          const weekStart = new Date(d);
          weekStart.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { day: 'numeric' })}`;
        case 'monthly':
          return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        case 'yearly':
          return d.getFullYear().toString();
        default:
          return d.toLocaleDateString();
      }
    };

    // Helper function to get week key for grouping
    const getWeekKey = (date) => {
      const d = new Date(date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
      return weekStart.toISOString().split('T')[0]; // YYYY-MM-DD format
    };

    // Get min and max dates from payments
    const dates = payments.map(p => new Date(p.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // Generate all possible time periods in the range
    const allPeriods = [];
    const current = new Date(minDate);

    while (current <= maxDate) {
      let periodDate = new Date(current);
      let key;
      
      if (timeRange === 'weekly') {
        key = getWeekKey(periodDate);
        // Advance to next week
        current.setDate(current.getDate() + 7);
      } else if (timeRange === 'monthly') {
        key = formatDate(periodDate, timeRange);
        // Advance to next month
        current.setMonth(current.getMonth() + 1);
      } else if (timeRange === 'yearly') {
        key = formatDate(periodDate, timeRange);
        // Advance to next year
        current.setFullYear(current.getFullYear() + 1);
      } else {
        // Daily
        key = formatDate(periodDate, timeRange);
        // Advance to next day
        current.setDate(current.getDate() + 1);
      }

      if (!allPeriods.some(p => p.key === key)) {
        allPeriods.push({
          key,
          date: new Date(periodDate),
          revenue: 0,
          expenses: 0
        });
      }
    }

    // Group payments by time range
    payments.forEach(payment => {
      const paymentDate = new Date(payment.date);
      let key;
      
      if (timeRange === 'weekly') {
        key = getWeekKey(paymentDate);
      } else {
        key = formatDate(paymentDate, timeRange);
      }

      const period = allPeriods.find(p => p.key === key);
      if (period) {
        if (payment.types === 'i') {  
          period.revenue += Number(payment.amount);
        } else {
          period.expenses += Number(payment.amount);
        }
      }
    });

    // Sort periods by date and convert to chart data format
    allPeriods
      .sort((a, b) => a.date - b.date)
      .forEach(({ key, revenue, expenses }) => {
        groupedData.labels.push(key);
        groupedData.revenue.push(revenue);
        groupedData.expenses.push(expenses);
      });

    return groupedData;
  }, [payments, timeRange]);

  // ... rest of the component remains the same ...
  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    const width = chartRef.current.width;
    const height = chartRef.current.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear previous chart
    ctx.clearRect(0, 0, width, height);

    // Find max value for scaling
    const maxValue = Math.max(...chartData.revenue, ...chartData.expenses, 1);

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.strokeStyle = "#e9ecef";
    ctx.stroke();

    // Draw grid lines and Y-axis labels
    ctx.font = "10px Arial";
    ctx.fillStyle = "#6c757d";
    ctx.textAlign = "right";
    const gridLines = 5;
    
    for (let i = 0; i <= gridLines; i++) {
      const value = Math.round((maxValue / gridLines) * i);
      const y = height - padding - (i / gridLines) * chartHeight;
      
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.strokeStyle = "#f8f9fa";
      ctx.stroke();
      
      ctx.fillText(value.toLocaleString(), padding - 5, y + 4);
    }

    // Draw labels - adjust font size if needed for long labels
    const labelFontSize = timeRange === 'weekly' ? "10px Arial" : "12px Arial";
    ctx.font = labelFontSize;
    ctx.fillStyle = "#6c757d";
    ctx.textAlign = "center";

    const barWidth = chartWidth / chartData.labels.length / 3;
    const groupWidth = barWidth * 2 + 10;

    chartData.labels.forEach((label, i) => {
      const x = padding + (i + 0.5) * (chartWidth / chartData.labels.length);
      ctx.fillText(label, x, height - padding + 20);
    });

    // Draw revenue bars
    chartData.revenue.forEach((value, i) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + (i + 0.5) * (chartWidth / chartData.labels.length) - groupWidth / 2;
      const y = height - padding - barHeight;

      ctx.fillStyle = "rgba(58, 134, 255, 0.7)";
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Display value on top of bar if there's space
      if (barHeight > 20 && value > 0) {
        ctx.fillStyle = "#fff";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(value.toLocaleString(), x + barWidth/2, y + 15);
      }
    });

    // Draw expense bars
    chartData.expenses.forEach((value, i) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + (i + 0.5) * (chartWidth / chartData.labels.length) - groupWidth / 2 + barWidth + 5;
      const y = height - padding - barHeight;

      ctx.fillStyle = "rgba(131, 56, 236, 0.7)";
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Display value on top of bar if there's space
      if (barHeight > 20 && value > 0) {
        ctx.fillStyle = "#fff";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(value.toLocaleString(), x + barWidth/2, y + 15);
      }
    });

    // Draw legend
    const legendX = width - padding - 150;
    const legendY = padding + 20;

    ctx.fillStyle = "rgba(58, 134, 255, 0.7)";
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = "#333";
    ctx.textAlign = "left";
    ctx.fillText("Revenue", legendX + 25, legendY + 12);

    ctx.fillStyle = "rgba(131, 56, 236, 0.7)";
    ctx.fillRect(legendX, legendY + 25, 15, 15);
    ctx.fillStyle = "#333";
    ctx.fillText("Expenses", legendX + 25, legendY + 37);

  }, [timeRange, chartData]);

  return (
    <canvas 
      ref={chartRef} 
      width={600} 
      height={300} 
      style={{ 
        width: "100%", 
        height: "100%",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}
    />
  );
};

export default RevenueChart;