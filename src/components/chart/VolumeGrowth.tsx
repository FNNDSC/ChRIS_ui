import * as React from "react";
import * as c3 from "c3";
import { Typeahead } from "react-bootstrap-typeahead";
import { segments, volumeData, age } from "../../assets/temp/volumeData";
import "./chart.scss";

interface ComponentProps {}

interface ComponentState {
  pushedSegments: [];
}

//const data : any[] = [];

const defaultChartData = [
  age,
  ["G_and_S_frontomargin_RHPatient", null, null, null, 2030, null, null, null],
  [
    "G_and_S_frontomargin_RHAverage",
    1517.2,
    1679.0,
    1923.3333333333333,
    2060.0,
    2373.0,
    2450.6,
    2499.25,
  ],
  [
    "G_and_S_frontomargin_RHFirstDevPos",
    1567.2,
    1729.0,
    1970.3333333333333,
    2110.0,
    2423.0,
    2500.6,
    2549.25,
  ],
  [
    "G_and_S_frontomargin_RHFirstDevNeg",
    1467.2,
    1629.0,
    1876.3333333333333,
    2010.0,
    2323.0,
    2400.6,
    2449.25,
  ],
];

const defaultSegments = ["G_and_S_frontomargin_RH"];

class VolumeGrowth extends React.Component<ComponentProps, ComponentState> {
  constructor(props: ComponentProps) {
    super(props);
    this.state = {
      pushedSegments: [],
    };

    this.changeData = this.changeData.bind(this);
  }

  fetchData() {
    for (let i = 0; i < 74; i++) {
      // eslint-disable-next-line
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
        colors: {
          G_and_S_frontomargin_RHPatient: "#00BFFF",
          G_and_S_frontomargin_RHAverage: "#FF0000",
          G_and_S_frontomargin_RHFirstDevPos: "#F08080",
          G_and_S_frontomargin_RHFirstDevNeg: "#F08080",
          G_and_S_frontomargin_LHPatient: "#FFA500",
          G_and_S_frontomargin_LHAverage: "#006600",
          G_and_S_frontomargin_LHFirstDevPos: "#009900",
          G_and_S_frontomargin_LHFirstDevNeg: "#009900",

          G_and_S_occipital_inf_RHPatient: "#00BFFF",
          G_and_S_occipital_inf_RHAverage: "#FF0000",
          G_and_S_occipital_inf_RHFirstDevPos: "#F08080",
          G_and_S_occipital_inf_RHFirstDevNeg: "#F08080",
          G_and_S_occipital_inf_LHPatient: "#FFA500",
          G_and_S_occipital_inf_LHAverage: "#006600",
          G_and_S_occipital_inf_LHFirstDevPos: "#009900",
          G_and_S_occipital_inf_LHFirstDevNeg: "#009900",

          G_and_S_paracentral_RHPatient: "#00BFFF",
          G_and_S_paracentral_RHAverage: "#FF0000",
          G_and_S_paracentral_RHFirstDevPos: "#F08080",
          G_and_S_paracentral_RHFirstDevNeg: "#F08080",
          G_and_S_paracentral_LHPatient: "#FFA500",
          G_and_S_paracentral_LHAverage: "#006600",
          G_and_S_paracentral_LHFirstDevPos: "#009900",
          G_and_S_paracentral_LHFirstDevNeg: "#009900",
        },
        regions: {
          G_and_S_frontomargin_RHFirstDevPos: [{ end: 13 }],
          G_and_S_frontomargin_RHFirstDevNeg: [{ end: 13 }],
          G_and_S_frontomargin_LHFirstDevPos: [{ end: 13 }],
          G_and_S_frontomargin_LHFirstDevNeg: [{ end: 13 }],

          G_and_S_occipital_inf_RHFirstDevPos: [{ end: 13 }],
          G_and_S_occipital_inf_RHFirstDevNeg: [{ end: 13 }],
          G_and_S_occipital_inf_LHFirstDevPos: [{ end: 13 }],
          G_and_S_occipital_inf_LHFirstDevNeg: [{ end: 13 }],

          G_and_S_paracentral_RHFirstDevPos: [{ end: 13 }],
          G_and_S_paracentral_RHFirstDevNeg: [{ end: 13 }],
          G_and_S_paracentral_LHFirstDevPos: [{ end: 13 }],
          G_and_S_paracentral_LHFirstDevNeg: [{ end: 13 }],
        },
      },
      padding: {
        top: 40,
        bottom: 20,
        right: 30,
      },
      axis: {
        x: {
          label: {
            text: "Age in Years",
            position: "outer-center",
          },
        },
        y: {
          label: {
            text: "Volume in mm\u00B3",
            position: "outer-middle",
          },
        },
      },
      tooltip: {
        format: {
          title(d) {
            return d + " Years old";
          },
        },
      },
      size: {
        height: 500, // **** Working find the element and resize to modal
      },
      grid: {
        x: {
          show: true,
        },
        y: {
          show: true,
        },
      },
    });
  }

  // Use this function once data of devation is available
  getDeviation(segment: string, deviation: number) {
    let devSegment: any;

    if (deviation > 0) {
      devSegment = segment.replace("FirstDevPos", "");
    } else {
      devSegment = segment.replace("FirstDevNeg", "");
    }

    let segmentData: any;
    segmentData = volumeData.find((segmentData) => {
      return segmentData[0] === devSegment + "Average";
    });

    for (let i = 0; i < segmentData.length; i++) {
      if (i > 0) {
        segmentData[i] = segmentData[i] + deviation;
      } else {
        segmentData[i] = segment;
      }
    }

    return segmentData;
  }

  getSegmentData(segment: string) {
    const segmentData = volumeData.find((segmentData) => {
      return segmentData[0] === segment;
    });
    return segmentData;
  }

  setFilter() {
    let filteredData: any[] = [];
    const volumeParameters = [
      "Average",
      "Patient",
      "FirstDevPos",
      "FirstDevNeg",
    ];

    if (this.state.pushedSegments.length > 0) {
      for (let i = 0; i < volumeParameters.length; i++) {
        filteredData = filteredData.concat(
          this.state.pushedSegments.map((segment) =>
            this.getSegmentData(segment + volumeParameters[i])
          )
        );
      }
    }

    filteredData.push(age);
    return filteredData;
  }

  changeData(selectedSegments: any) {
    // Call back function to avoid asynchronous setState
    let processedData;
    this.setState(
      {
        pushedSegments: selectedSegments,
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
            onChange={(selectedSegments) => this.changeData(selectedSegments)}
          />
        </React.Fragment>
        <div id="VolumeGrowth" />
      </div>
    );
  }
}

export default VolumeGrowth;
