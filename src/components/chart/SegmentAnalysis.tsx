import * as React from "react";
import * as c3 from "c3";
import { Typeahead } from "react-bootstrap-typeahead";
import "./chart.scss";

interface ComponentProps {

}

interface ComponentState {
    pushedSegments: string[];
}

// csvData format [[segmentName1, LH1, RH1],[segmentName2, LH2, RH2]]
const csvData = [
  ["G_and_S_frontomargin", 1.1234, 1.1234],
  ["G_and_S_occipital_inf", 1.2345, 1.2345],
  ["G_and_S_paracentral", 1.3456, 1.3456],
  ["G_and_S_subcentral", 1.4567, 1.4567],
  ["G_and_S_transv_frontopol", 1.5678, 1.5678],
  ["G_and_S_cingul-Ant", 1.6789, 1.6789],
  ["G_and_S_cingul-Mid-Ant", 1.6789, 1.6789],
  ["G_and_S_cingul-Mid-Post", 1.6789, 1.6789],
  ["G_cingul-Post-dorsal", 1.6789, 1.6789],
  ["G_cingul-Post-ventral", 1.6789, 1.6789],
  ["G_cuneus,2230,1543,3356", 1.6789, 1.6789],
  ["G_front_inf-Opercular", 1.6789, 1.6789],
  ["G_front_inf-Orbital", 1.6789, 1.6789],
  ["G_front_inf-Triangul", 1.6789, 1.6789],
  ["G_front_middle", 1.6789, 1.6789],
  ["G_front_sup", 1.6789, 1.6789],
  ["G_Ins_lg_and_S_cent_ins", 1.6789, 1.6789],
  ["G_insular_short", 1.6789, 1.6789],
  ["G_occipital_middle", 1.6789, 1.6789],
  ["G_occipital_sup", 1.6789, 1.6789],
  ["G_oc-temp_lat-fusifor", 1.6789, 1.6789],
  ["G_oc-temp_med-Lingual", 1.6789, 1.6789],
  ["G_oc-temp_med-Parahip", 1.6789, 1.6789],
  ["G_orbital", 1.6789, 1.6789],
  ["G_pariet_inf-Angular", 1.6789, 1.6789],
  ["G_pariet_inf-Supramar", 1.6789, 1.6789],
  ["G_parietal_sup", 1.6789, 1.6789],
  ["G_postcentral", 3.7890, 3.8900],
  ["G_precentral", 3.1111, 3.2122],
  ["G_precuneus", -3.1111, -3.2122],
  ["G_rectus", -2.6789, -2.5890],
  ["G_subcallosal", 1.6789, 1.6789],
  ["G_temp_sup-G_T_transv", 1.6789, 1.6789],
  ["G_temp_sup-Lateral", 1.6789, 1.6789],
  ["G_temp_sup-Plan_polar", 1.6789, 1.6789],
  ["G_temp_sup-Plan_tempo", 1.6789, 1.6789],
  ["G_temporal_inf", 1.6789, 1.6789],
  ["G_temporal_middle", 1.6789, 1.6789],
  ["Lat_Fis-ant-Horizont", 1.6789, 1.6789],
  ["Lat_Fis-ant-Vertical", 1.6789, 1.6789],
  ["Lat_Fis-post", 1.6789, 1.6789],
  ["Pole_occipital", 1.6789, 1.6789],
  ["Pole_temporal", 1.6789, 1.6789],
  ["S_calcarine", 1.6789, 1.6789],
  ["S_central", 1.6789, 1.6789],
  ["S_cingul-Marginalis", 1.6789, 1.6789],
  ["S_circular_insula_ant", 1.6789, 1.6789],
  ["S_circular_insula_inf", 1.6789, 1.6789],
  ["S_circular_insula_sup", 1.6789, 1.6789],
  ["S_collat_transv_ant", 1.6789, 1.6789],
  ["S_collat_transv_post", 1.6789, 1.6789],
  ["S_front_inf", 1.6789, 1.6789],
  ["S_front_middle", 1.6789, 1.6789],
  ["S_front_sup", 1.6789, 1.6789],
  ["S_interm_prim-Jensen", 1.6789, 1.6789],
  ["S_intrapariet_and_P_trans", 1.6789, 1.6789],
  ["S_oc_middle_and_Lunatus", 1.6789, 1.6789],
  ["S_oc_sup_and_transversal", 1.6789, 1.6789],
  ["S_occipital_ant", 1.3456, 1.3456],
  ["S_oc-temp_lat", 1.3456, 1.3456],
  ["S_oc-temp_med_and_Lingual", 1.3456, 1.3456],
  ["S_orbital_lateral", 1.3456, 1.3456],
  ["S_orbital_med-olfact", 1.3456, 1.3456],
  ["S_orbital-H_Shaped", 1.3456, 1.3456],
  ["S_parieto_occipital", 1.1234, 1.1234],
  ["S_pericallosal", 1.1234, 1.1234],
  ["S_postcentral", 1.1234, 1.1234],
  ["S_precentral-inf-part", 1.1234, 1.1234],
  ["S_precentral-sup-part", 1.1234, 1.1234],
  ["S_suborbital", 1.1234, 1.1234],
  ["S_subparietal", 1.1234, 1.1234],
  ["S_temporal_inf", 1.1234, 1.1234],
  ["S_temporal_sup", 1.1234, 1.1234],
  ["S_temporal_transverse", 1.1234, 1.1234]
];

const defaultSegments: any[] = [];
const defaultLeft : any[] = [];
const defaultRight : any[] = [];

const segments: any[] = [];
const segmentValues: any[] = [];

class SegmentAnalysis extends React.Component<ComponentProps, ComponentState> {
  constructor(props: ComponentProps) {
    super(props);

    this.state = {
      pushedSegments: [],
    };

    this.changeData = this.changeData.bind(this);
  }

  readData() {
    for(let i = 0; i < csvData.length; i++){
      segments.push(csvData[i][0]);
      segmentValues.push([csvData[i][1], csvData[i][2]]);
    }
  }

  pickDefaultSegments(segmentOffSet: any) {
    let segmentData;
    defaultLeft.push("leftHemisphere");
    defaultRight.push("rightHemisphere");
    // Top-4 Offset segments displayed by default
    for ( let i = 0; i < 4; i++ ) {
      segmentData = this.getSegmentData(segmentOffSet[i][0]);
      if (segmentData) {
        defaultSegments.push(segmentData[0]);
        defaultLeft.push(segmentData[1]);
        defaultRight.push(segmentData[2]);
      }
    }

    this.setState({ pushedSegments: defaultSegments})
  }

  sortFunction(a: any, b: any) {
    if (a[1] === b[1]) {
      return 0;
    } else {
      return (a[1] < b[1]) ? 1 : -1;
    }
  }

  calculateOffset() {
    let segmentOffSet: any[] = [];
    let result: any[] = [];
    for ( let i = 0; i < segments.length; i++ ) {
      segmentOffSet.push([segments[i], Math.abs(segmentValues[i][0]) +
                                        Math.abs(segmentValues[i][1])]);
    }
    result = segmentOffSet.sort(this.sortFunction);
    this.pickDefaultSegments(result);
  }

  componentWillMount() {
    //Calculate Offset
    this.readData();
    this.calculateOffset();
  }

  componentDidMount() {
    //console.log('componentDidMount');
    this.callChart([defaultLeft, defaultRight]);
  }

  callChart(inputChart: any) {
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
            categories: this.state.pushedSegments,
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
        right: 50
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
      this.callChart(processedData);
    });
  }

  render() {
    return (
      <div className="chart-viewer">
        <React.Fragment>
          <Typeahead
            clearButton
            defaultSelected={this.state.pushedSegments}
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
