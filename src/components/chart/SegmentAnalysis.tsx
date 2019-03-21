import * as React from 'react';
import * as c3 from 'c3';
import { Typeahead } from "react-bootstrap-typeahead";

interface ComponentProps {

}

interface ComponentState {
    pushedSegments: [];
}

// csvData format [[segmentName1, LH1, RH1],[segmentName2, LH2, RH2]]
const csvData = [
  ['GSFrontToMargin', 30, 34],
  ['GOrbital', -20, -16],
  ['GTemporalMiddle', 10, 14],
  ['SCentral', 40, 44],
  ['SFrontSup', -15, -11],
  ['STemporalInf', 25, 20]
];

const defaultLeftHemisphere = ['leftHemisphere', 30, -20, 25];
const defaultRightHemisphere = ['rightHemisphere', 34, -16, 20];
const defaultChartData = [ defaultLeftHemisphere, defaultRightHemisphere ];
const defaultSegments = ['GSFrontToMargin', 'GOrbital', 'STemporalInf']

const segments = ['GSFrontToMargin', 'GOrbital', 'GTemporalMiddle',
                    'SCentral', 'SFrontSup', 'STemporalInf'];

class SegmentAnalysis extends React.Component<ComponentProps, ComponentState> {
  constructor(props : ComponentProps) {
    super(props);

    this.state = {
      pushedSegments: []
    };

    this.changeData = this.changeData.bind(this);
  }

  componentDidMount() {
    this.renderChart(defaultChartData, defaultSegments);
  }

  renderChart(inputChart: any, segments: any) {
    var chart = c3.generate({
      data: {
        columns: inputChart,
        type: 'bar',
        colors: {
            leftHemisphere: '#FFA500',
            rightHemisphere: '#00BFFF'
        }
      },
      axis: {
        x: {
            type: 'category',
            categories: segments,
        },
        y: {
            label: {
                text: 'Deviation from Standard in %',
                position: 'outer-middle'
            }
        }
      },
      grid: {
        y: {
            lines: [
                {value: 0, text: 'Average', position: 'start'},
            ]
        }
      },
      padding: {
        top: 30,
        bottom: 20
      }
    });
  }

  parseData(filteredData: any) {
    var leftHemisphereData = ['leftHemisphere'];
    var rightHemisphereData = ['rightHemisphere'];
    // Parse for the leftHemisphereData and rightHemisphereData
    for(var i = 0; i < filteredData.length; i++){
      leftHemisphereData.push(filteredData[i][1]);
      rightHemisphereData.push(filteredData[i][2]);
    }
    return [leftHemisphereData, rightHemisphereData];
  }

  getSegmentData(segment: any){
    var segmentData;
    segmentData = csvData.find(function(segmentData) {
      return (segmentData[0] === segment);
    });
    return segmentData;
  }

  setFilter(){
    var filteredData : any[] = [];
    var parsedData : any[] = [];
    if(this.state.pushedSegments.length > 0) {
        filteredData = this.state.pushedSegments.map(segment =>
          this.getSegmentData(segment));
    }
    parsedData = this.parseData(filteredData);
    // return parseData
    return parsedData;
  }

  changeData(selectedSegments: any) {
    // Call back function to avoid asynchronous setState
    var processedData;
    this.setState({
      pushedSegments : selectedSegments
    }, () => {
      //Input processing
      processedData = this.setFilter();
      this.renderChart(processedData, this.state.pushedSegments);
    });
  }

  render() {
    return (
      <div>
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
        <div id="chart"></div>
      </div>
    );
  }
}

export default SegmentAnalysis;
