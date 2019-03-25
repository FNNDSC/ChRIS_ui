import * as React from "react";
import * as c3 from "c3";
import { Typeahead } from "react-bootstrap-typeahead";
import "./chart.scss";

interface ComponentProps {

}

interface ComponentState {
    pushedSegments: [];
}

// csvData format [[segmentName1, LH1, RH1],[segmentName2, LH2, RH2]]
const csvData = [
  ["GSFrontToMargin", 30, 34],
  ["GOrbital", -20, -16],
  ["GTemporalMiddle", 10, 14],
  ["SCentral", 40, 44],
  ["SFrontSup", -15, -11],
  ["STemporalInf", 25, 20]
];

const defaultLeftHemisphere = ["leftHemisphere", 30, -20, 25];
const defaultRightHemisphere = ["rightHemisphere", 34, -16, 20];
const defaultChartData = [ defaultLeftHemisphere, defaultRightHemisphere ];
const defaultSegments = ["GSFrontToMargin", "GOrbital", "STemporalInf"];

const segments = ["GSFrontToMargin", "GOrbital", "GTemporalMiddle",
                    "SCentral", "SFrontSup", "STemporalInf"];

class SegmentAnalysis extends React.Component<ComponentProps, ComponentState> {
  constructor(props: ComponentProps) {
    super(props);

    this.state = {
      pushedSegments: []
    };

    this.changeData = this.changeData.bind(this);
  }

  componentDidMount() {
    this.callChart(defaultChartData, defaultSegments);
  }

  callChart(inputChart: any, segments: any) {
    c3.generate({
      bindto: "#SegmentAnalysis",
      data: {
        columns: inputChart,
        type: "bar",
        colors: {
            leftHemisphere: "#FFA500",
            rightHemisphere: "#00BFFF"
        }
      },
      axis: {
        x: {
            type: "category",
            categories: segments,
        },
        y: {
            label: {
                text: "Deviation from Standard in %",
                position: "outer-middle"
            }
        }
      },
      grid: {
        y: {
            lines: [
                {value: 0, text: "Average", position: "start"},
            ]
        }
      },
      padding: {
        top: 40,
        bottom: 20,
        right: 20
      },
      size: {
        height: 500 // **** Working find the element and resize to modal
      }
    });
  }

  parseData(filteredData: any) {
    const leftHemisphereData = ["leftHemisphere"];
    const rightHemisphereData = ["rightHemisphere"];
    // Parse for the leftHemisphereData and rightHemisphereData
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < filteredData.length; i++) {
      leftHemisphereData.push(filteredData[i][1]);
      rightHemisphereData.push(filteredData[i][2]);
    }
    return [leftHemisphereData, rightHemisphereData];
  }

  getSegmentData(segment: any) {
    const segmentData = csvData.find((segmentData) => {
      return (segmentData[0] === segment);
    });
    return segmentData;
  }

  setFilter() {
    let filteredData: any[] = [];
    let parsedData: any[] = [];
    if (this.state.pushedSegments.length > 0) {
        filteredData = this.state.pushedSegments.map((segment) =>
          this.getSegmentData(segment));
    }
    parsedData = this.parseData(filteredData);
    return parsedData;
  }

  changeData(selectedSegments: any) {
    // Call back function to avoid asynchronous setState
    let processedData;
    this.setState({
      pushedSegments : selectedSegments
    }, () => {
      // Input processing
      processedData = this.setFilter();
      this.callChart(processedData, this.state.pushedSegments);
    });
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
            onChange={(selectedSegments) => this.changeData(selectedSegments)}
          />
        </React.Fragment>
        <div id="SegmentAnalysis"></div>
      </div>
    );
  }
}

export default SegmentAnalysis;
