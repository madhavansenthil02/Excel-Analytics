import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api';

/* ──────────── Async Thunks ──────────── */

export const uploadExcel = createAsyncThunk(
  'excel/uploadExcel',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/excel/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      return rejectWithValue(error.response?.data || 'Upload failed');
    }
  }
);

export const fetchFileList = createAsyncThunk(
  'excel/fetchFiles',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token'); // or get it from state
      const response = await API.get('/excel/excelfiles', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ fetchFileList error: ', err.response?.data || err.message);
      return thunkAPI.rejectWithValue(err.response?.data?.msg || 'Failed to fetch files');
    }
  }
);

export const fetchChartData = createAsyncThunk(
  'excel/fetchChartData',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/excel/chart');
      const { data, headers } = res.data;

      if (!data || data.length === 0 || headers.length < 2) {
        throw new Error('No data available for chart');
      }

      // Example: X = first column, Y = second column
      const xAxis = headers[0];
      const yAxis = headers[1];

      const labels = data.map((row) => row[xAxis]);
      const values = data.map((row) => parseFloat(row[yAxis]));

      return {
        labels,
        datasets: [
          {
            label: `${yAxis} vs ${xAxis}`,
            data: values,
            backgroundColor: 'rgba(75,192,192,0.6)',
            borderColor: 'rgba(75,192,192,1)',
            fill: true,
            tension: 0.3
          }
        ]
      };
    } catch (error) {
      console.error('Chart Data Fetch Error:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch chart data');
    }
  }
);

export const loadFileData = createAsyncThunk(
  'excel/loadFileData',
  async (fileId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.get(`/excel/file/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (err) {
      console.error('Load file error:', err);
      return rejectWithValue(err.response?.data || 'Failed to load file');
    }
  }
);


/* ──────────── Initial State ──────────── */

const initialState = {
  fileData: null,
  fileList: [],
  chartData: null,
  currentFile: null,
  uploadedFile: null,
  headers: [],
  xAxis: '',
  yAxis: '',
  chartType: 'bar',
  status: 'idle',
  loading: false,
  error: null,
};

/* ──────────── Slice ──────────── */

const excelSlice = createSlice({
  name: 'excel',
  initialState,
  reducers: {
    clearExcelState: (state) => {
      state.fileData = null;
      state.fileList = [];
      state.chartData = null;
      state.currentFile = null;
      state.uploadedFile = null;
      state.headers = [];
      state.xAxis = '';
      state.yAxis = '';
      state.chartType = 'bar';
      state.status = 'idle';
      state.loading = false;
      state.error = null;
    },
    setCurrentFile: (state, action) => {
      const file = action.payload.file;
      state.currentFile = file;
      state.fileData = file.parsedData || file.data || [];
      state.headers = file.headers || Object.keys(file.data?.[0] || {});
    },
    setXAxis: (state, action) => {
      state.xAxis = action.payload;
    },
    setYAxis: (state, action) => {
      state.yAxis = action.payload;
    },
    setChartType: (state, action) => {
      state.chartType = action.payload;
    },
    generateChart: (state) => {
      const { fileData, xAxis, yAxis, chartType } = state;
      if (!fileData || !xAxis || !yAxis) {
        state.chartData = null;
        return;
      }

      const labels = fileData.map((row) => row[xAxis]);
      const dataPoints = fileData.map((row) => parseFloat(row[yAxis]));

      // Handle scatter chart differently
      if (chartType === 'scatter') {
        const scatterData = fileData.map((row) => ({
          x: parseFloat(row[xAxis]),
          y: parseFloat(row[yAxis]),
        }));
        state.chartData = {
          datasets: [
            {
              label: `${yAxis} vs ${xAxis}`,
              data: scatterData,
              backgroundColor: 'rgba(75,192,192,0.6)',
            },
          ],
        };
      } else {
        state.chartData = {
          labels,
          datasets: [
            {
              label: `${yAxis} vs ${xAxis}`,
              data: dataPoints,
              backgroundColor: 'rgba(75,192,192,0.6)',
              borderColor: 'rgba(75,192,192,1)',
              fill: chartType !== 'line' ? true : false,
              tension: 0.3,
            },
          ],
        };
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(uploadExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadExcel.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadedFile = action.payload.filename;
      })
      .addCase(uploadExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchFileList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFileList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.fileList = action.payload;
      })
      .addCase(fetchFileList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(fetchChartData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.loading = false;
        state.chartData = action.payload;
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadFileData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFileData.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFile = {
          filename: action.payload.filename,
          data: action.payload.data
        };
        state.fileData = action.payload.data;
        state.headers = action.payload.headers;
      })
      .addCase(loadFileData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* ──────────── Exports ──────────── */

export const {
  clearExcelState,
  setCurrentFile,
  setXAxis,
  setYAxis,
  setChartType,
  generateChart,
} = excelSlice.actions;

export default excelSlice.reducer;
