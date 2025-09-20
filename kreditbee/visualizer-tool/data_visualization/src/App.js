import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dropdown from './components/Dropdown';
import Chart from './components/Chart';
import Modal from 'react-modal';
import Aggsel from './components/Aggsel';
import './App.css'; // Ensure you have your CSS file imported

Modal.setAppElement('#root'); // Assuming '#root' is the main application element

function App() {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);
  const [selectedXColumn, setSelectedXColumn] = useState('');
  const [selectedYColumn, setSelectedYColumn] = useState([]);
  const [selectChart, setSelectChart] = useState('');
  const [selectedDataPoints, setSelectedDataPoints] = useState('1000');
  const [selectAgg, setSelectAgg] = useState('');
  const [isAggClicked, setIsAggClicked] = useState(false);
  const [mappedChartData, setMappedChartData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [labelToAdd, setLabelToAdd] = useState('');

  const fetchParquetData = () => {
    axios.get('http://127.0.0.1:5000/parquet-data')
      .then((response) => {
        setData(JSON.parse(response.data.replace(/\bNaN\b/g, "null")));
        setLoad(true);
      })
      .catch((error) => {
        setError(error.message);
        console.error('Error fetching data:', error);
      });
  };

  useEffect(() => {
    fetchParquetData();
  }, []);

  const handleAggregation = () => {
    if (selectChart === 'box') {
      setIsAggClicked(true);
      setMappedChartData(data);
      return;
    }
    axios.get('http://127.0.0.1:5000/chart-data', {
      params: {
        selected_agg: selectAgg,
        selected_y_columns: selectedYColumn.join(','),  // Updated to handle multiple columns
        selected_x_column: selectedXColumn
      }
    })
      .then((response) => {
        const parsedData = response.data;
        setIsAggClicked(true);
        setLoad(true);
        setMappedChartData(parsedData);
      })
      .catch((error) => {
        setError(error.message);
        console.error('Error fetching chart data:', error);
      });
  };

  const handleXColumnChange = (event) => {
    setSelectedXColumn(event.target.value);
    setIsAggClicked(false);
  };

  const handleYColumnChange = (event) => {
    setSelectedYColumn([event.target.value]);
    if (selectChart === 'mul-line-chart' || selectChart === 'mul-bar-chart') {
      setIsModalOpen(true);  // Open the modal to add more columns if it's a multi-line or multi-bar chart
    }
  };

  const handleCharts = (e) => {
    setSelectChart(e.target.value);
    setSelectedXColumn('');
    setSelectedYColumn([]);
    setSelectAgg('');
    setIsAggClicked(false);
    setMappedChartData([]);
  };

  const handleDataPointsChange = (e) => {
    setSelectedDataPoints(e.target.value);
    setIsAggClicked(false);
  };

  const handleAggChange = (agg) => {
    setSelectAgg(agg);
    setIsAggClicked(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setLabelToAdd('');
  };

  const handleLabelChange = (e) => {
    setLabelToAdd(e.target.value);
  };

  const addLabel = () => {
    if (labelToAdd && !selectedYColumn.includes(labelToAdd)) {
      setSelectedYColumn([...selectedYColumn, labelToAdd]);
    }
    handleModalClose();
  };

  const filterColumns = () => {
    const categoricalColumns = [];
    const numericalColumns = [];

    if (data.length) {
      Object.keys(data[0]).forEach(key => {
        if (typeof data[0][key] === 'number') {
          numericalColumns.push({ value: key, label: key });
        } else {
          categoricalColumns.push({ value: key, label: key });
        }
      });
    }

    return { categoricalColumns, numericalColumns };
  };

  const { categoricalColumns, numericalColumns } = filterColumns();

  return (
    <>
      {error ? (
        <div>Error: {error}</div>
      ) : (
        <div className='drop'>
          <Dropdown label="Select Chart Type" value={selectChart} onChange={handleCharts} options={[
            { value: "", label: "--Select the chart you want to plot--" },
            { value: "line", label: "Line Chart" },
            { value: "bar", label: "Bar Chart" },
            { value: "box", label: "Single Box Plot" },
            { value: "pie-chart", label: "Pie Chart" },
            { value: "mul-line-chart", label: "Multiple Line Chart" },
            { value: "mul-bar-chart", label: "Multiple Bar Chart" }
          ]} />

          {selectChart !== 'box' && (
            <>
              <Aggsel selectedAgg={selectAgg} onSelectAggregator={handleAggChange} />
              
              <Dropdown
                label={selectChart === 'pie-chart' ? "Select Categorical Data" : "Select X axis"}
                value={selectedXColumn}
                onChange={handleXColumnChange}
                options={[
                  { value: "", label: selectChart === 'pie-chart' ? "--Select Categorical Data--" : "--Select X axis--" },
                  ...(
                    selectChart === 'pie-chart'
                      ? categoricalColumns
                      : Object.keys(data[0] || {}).map((columnName) => ({
                          value: columnName, label: columnName
                        }))
                  )
                ]}
              />
            </>
          )}

          <Dropdown
            label={selectChart === 'pie-chart' ? "Select Numerical Data" : "Select Y axis"}
            value={selectedYColumn[0] || ''}
            onChange={handleYColumnChange}
            options={[
              { value: "", label: selectChart === 'pie-chart' ? "--Select Numerical Data--" : "--Select Y axis--" },
              ...(
                selectChart === 'pie-chart'
                  ? numericalColumns
                  : Object.keys(data[0] || {}).map((columnName) => ({
                      value: columnName, label: columnName
                    }))
              )
            ]}
          />

          {(selectChart === 'mul-line-chart' || selectChart === 'mul-bar-chart') && selectedYColumn.length > 0 && (
            <button onClick={() => setIsModalOpen(true)}>Add Another Y Column</button>
          )}

          <Dropdown label="Select Data Points" value={selectedDataPoints} onChange={handleDataPointsChange} options={[
            { value: "", label: "--Select the number of data points--" },
            { value: "100", label: "1-100 Data Points" },
            { value: "500", label: "1-500 Data Points" },
            { value: "1000", label: "1-1000 Data Points" }
          ]} />

          <br />
          <center>
            <button onClick={handleAggregation}>VIEW GRAPH</button>
          </center>
          <br />
          {load && isAggClicked && ((selectChart !== 'box' && selectedXColumn) || selectChart === 'box') && selectedYColumn.length > 0 && selectChart && selectedDataPoints ? (
            <Chart
              selectChart={selectChart}
              selectedXColumn={selectedXColumn}
              selectedYColumn={selectedYColumn} // Updated to pass multiple columns
              selectedDataPoints={selectedDataPoints}
              isAggClicked={isAggClicked}
              mappedChartData={mappedChartData}
              data={data}
            />
          ) : (
            <div>Please select values for Y axis, chart type, and number of data points</div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        contentLabel="Add Another Y Column"
        className="custom-modal"
        overlayClassName="custom-overlay"
      >
        <h2>Select Another Y Column</h2>
        <Dropdown
          label="Select Y axis"
          value={labelToAdd}
          onChange={handleLabelChange}
          options={[
            { value: "", label: "--Select Y axis--" },
            ...numericalColumns
          ]}
        />
        <div className="modal-buttons">
          <button onClick={addLabel}>Add Column</button>
          <button onClick={handleModalClose}>Cancel</button>
        </div>
      </Modal>
    </>
  );
}

export default App;
