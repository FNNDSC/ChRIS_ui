import * as React from "react";
import * as c3 from "c3";
import { Typeahead } from "react-bootstrap-typeahead";
import "./chart.scss";
interface ComponentProps {
}

interface ComponentState {
  pushedSegments: [];
}

const age = ["age", 7, 8, 9, 10, 11, 12, 13];

/* Age Vs Volume data for the graph*/
const chartData = [
  age,
  ["GOrbitalAverage", 90, 103, 110, 113, 117, 122, 127],
  ["GOrbitalPatient", null, null, null, 109, null, null, null],
  ["SCentralAverage",  190, 196, 208, 213, 217, 222, 225],
  ["SCentralPatient", null, null, null, 190, null, null, null],
  ["STemporalInfAverage", 280, 294, 318, 320, 320, 321, 323],
  ["STemporalInfPatient", null, null, null, 329, null, null, null]
];

const defaultChartData = [
  age,
  ["SCentralAverage",  190, 196, 208, 213, 217, 222, 225],
  ["SCentralPatient", null, null, null, 203, null, null, null]
];

const defaultSegments = ["SCentral"];
const allSegments = ["GOrbital", "SCentral", "STemporalInf"];

class VolumeGrowth extends React.Component<ComponentProps, ComponentState> {
  constructor(props: ComponentProps) {
    super(props);
    this.state = {
      pushedSegments: []
    };

    this.changeData = this.changeData.bind(this);
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
          GOrbitalAverage: "#FFA500",
          GOrbitalPatient: "#FFA500",
          SCentralAverage: "#00BFFF",
          SCentralPatient: "#00BFFF",
          STemporalInfAverage: "#12E73B",
          STemporalInfPatient: "#12E73B"
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
    const segmentData = chartData.find(segmentData => {
      return segmentData[0] === segment;
    });
    return segmentData;
  }

  setFilter() {
    let filteredData: any[] = [];
    // Get the Patient data for the segment
    if (this.state.pushedSegments.length > 0) {
      filteredData = this.state.pushedSegments.map(segment =>
        this.getSegmentData(segment + "Patient")
      );
    }
    // Get the Average data for the segment
    if (this.state.pushedSegments.length > 0) {
      filteredData = filteredData.concat(
        this.state.pushedSegments.map(segment =>
          this.getSegmentData(segment + "Average")
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
            options={allSegments}
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
