import * as React from "react";
import * as c3 from "c3";
import { Typeahead } from "react-bootstrap-typeahead";
import {segments, volumeData, age} from "../../assets/temp/volumeData";
import "./chart.scss";

interface ComponentProps {
}

interface ComponentState {
  pushedSegments: [];
}

const data : any[] = [];

const defaultChartData = [
  age,
  ["G_and_S_frontomargin_RHPatient", null, null, null, 2050, null, null, null],
  ["G_and_S_frontomargin_RHAverage", 1517.2, 1679.0, 1923.3333333333333, 2298.0, 2373.0, 2450.6, 2499.25],
  ["G_and_S_frontomargin_LHPatient", null, null, null, 1950, null, null, null],
  ["G_and_S_frontomargin_LHAverage", 1617.2, 1650.0, 1890.3333333333333, 2198.0, 2273.0, 2350.6, 2349.25]
];

const defaultSegments = ["G_and_S_frontomargin"];

class VolumeGrowth extends React.Component<ComponentProps, ComponentState> {
  constructor(props: ComponentProps) {
    super(props);
    this.state = {
      pushedSegments: []
    };

    this.changeData = this.changeData.bind(this);
  }

  fetchData() {
    for(let i = 0; i < 74; i++){
      let segment: any[] = [];
    }
  }

  componentWillMount() {
    this.fetchData();
  }

  componentDidMount() {
    this.callChart(defaultChartData);
  }

  callChart(inputChart: any) {
    c3.generate({
      bindto: "#VolumeGrowth",
      data: {
        x: "age",
        columns: inputChart,
        type: "spline",
        colors: {
          G_and_S_frontomargin_LHPatient: "#FFA500",
          G_and_S_frontomargin_RHPatient: "#00BFFF",
          G_and_S_frontomargin_LHAverage: "#FFA500",
          G_and_S_frontomargin_RHAverage: "#00BFFF",
          G_and_S_occipital_inf_LHPatient: "#00BFFF",
          G_and_S_occipital_inf_RHPatient: "#00BFFF",
          G_and_S_occipital_inf_LHAverage: "#00BFFF",
          G_and_S_occipital_inf_RHAverage: "#00BFFF"
        }
      },
      padding: {
        top: 40,
        bottom: 20,
        right: 30
      },
      axis: {
        x: {
          label: {
            text: "Age in Years",
            position: "outer-center"
          }
        },
        y: {
          label: {
            text: "Size in cm3",
            position: "outer-middle"
          }
        }
      },
      tooltip: {
        format: {
          title(d) {
            return d + " Years old";
          }
        }
      },
      size: {
        height: 500 // **** Working find the element and resize to modal
      }
    });
  }

  getSegmentData(segment: string) {
    const segmentData = volumeData.find(segmentData => {
      return segmentData[0] === segment;
    });
    return segmentData;
  }

  setFilter() {
    let filteredData: any[] = [];
    // Get the Patient data for the segment
    if (this.state.pushedSegments.length > 0) {
      filteredData = this.state.pushedSegments.map(segment =>
        this.getSegmentData(segment + "_LHAverage")
      );
    }
    // Get the Average data for the segment
    if (this.state.pushedSegments.length > 0) {
      filteredData = filteredData.concat(
        this.state.pushedSegments.map(segment =>
          this.getSegmentData(segment + "_LHPatient")
        )
      );
    }
    // Get the Average data for the segment
    if (this.state.pushedSegments.length > 0) {
      filteredData = filteredData.concat(
        this.state.pushedSegments.map(segment =>
          this.getSegmentData(segment + "_RHAverage")
        )
      );
    }
    // Get the Average data for the segment
    if (this.state.pushedSegments.length > 0) {
      filteredData = filteredData.concat(
        this.state.pushedSegments.map(segment =>
          this.getSegmentData(segment + "_RHPatient")
        )
      );
    }

    filteredData.push(age);
    return filteredData;
  }

  changeData(selectedSegments: any) {
    // Call back function to avoid asynchronous setState
    let processedData;
    this.setState(
      {
        pushedSegments: selectedSegments
      },
      () => {
        // Input processing
        processedData = this.setFilter();
        this.callChart(processedData);
      }
    );
  }

  render() {
    return (
      <div className="chart-viewer">
        <React.Fragment>
          <Typeahead
            clearButton
            defaultSelected={defaultSegments}
            id="selector"
            multiple
            options={segments}
            placeholder="Choose a brain segment..."
            onChange={selectedSegments => this.changeData(selectedSegments)}
          />
        </React.Fragment>
        <div id="VolumeGrowth" />
      </div>
    );
  }
}

export default VolumeGrowth;
