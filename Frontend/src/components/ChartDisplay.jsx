import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generateChart, setChartType, setXAxis, setYAxis } from '../redux/slices/excelSlice';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartDisplay = () => {
  const dispatch = useDispatch();
  const chartRef = useRef(null);
  const [downloadUrl, setDownloadUrl] = useState('');

  const {
    currentFile,
    chartData,
    chartType,
    xAxis,
    yAxis,
    headers
  } = useSelector(state => state.excel);

  useEffect(() => {
    if (currentFile && xAxis && yAxis) {
      dispatch(generateChart({
        data: currentFile.data,
        xAxis,
        yAxis,
        chartType
      }));
    }
  }, [currentFile, xAxis, yAxis, chartType, dispatch]);

  const handleDownload = () => {
    if (!chartRef.current) return;
    const chartCanvas = chartRef.current.canvas;
    const url = chartCanvas.toDataURL('image/png');
    setDownloadUrl(url);
  };

  const renderChart = () => {
    if (!chartData) {
      return <p className="text-gray-500">Select X, Y axis and chart type to view the chart.</p>;
    }

    const options = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: `${currentFile?.filename} - ${xAxis} vs ${yAxis}`,
        },
      },
    };

    // KEY FIX — force chart to rebuild cleanly
    const chartKey = `${chartType}-${xAxis}-${yAxis}-${currentFile?.filename}`;
    const chartProps = { options, data: chartData, ref: chartRef, key: chartKey };

    switch (chartType) {
      case 'bar':
        return <Bar {...chartProps} />;
      case 'line':
        return <Line {...chartProps} />;
      case 'pie':
        return <Pie {...chartProps} />;
      case 'scatter':
        return <Scatter {...chartProps} />;
      default:
        return <Bar {...chartProps} />;
    }
  };

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* X Axis */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">X Axis</label>
          <select
            value={xAxis}
            onChange={(e) => dispatch(setXAxis(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select X Axis</option>
            {headers?.map((header, index) => (
              <option key={index} value={header}>{header}</option>
            ))}
          </select>
        </div>

        {/* Y Axis */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Y Axis</label>
          <select
            value={yAxis}
            onChange={(e) => dispatch(setYAxis(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Y Axis</option>
            {headers?.map((header, index) => (
              <option key={index} value={header}>{header}</option>
            ))}
          </select>
        </div>

        {/* Chart Type */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
          <select
            value={chartType}
            onChange={(e) => dispatch(setChartType(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="scatter">Scatter Plot</option>
          </select>
        </div>

        {/* Download Button */}
        <div className="flex items-end">
          <button
            onClick={handleDownload}
            disabled={!chartData}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Download Chart
          </button>

          {downloadUrl && (
            <a
              href={downloadUrl}
              download={`${currentFile.filename}-${xAxis}-vs-${yAxis}.png`}
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => setDownloadUrl('')}
            >
              Save Image
            </a>
          )}
        </div>
      </div>

      {/* Chart Render */}
      <div className="h-96">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartDisplay;
