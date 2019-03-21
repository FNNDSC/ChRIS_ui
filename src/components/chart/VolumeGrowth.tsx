import * as React from 'react';
import * as c3 from 'c3';
import { Typeahead } from "react-bootstrap-typeahead";

interface ComponentProps {

}

interface ComponentState {
    pushedSegments: [];
}

/* Age Vs Volume data for the graph*/
const chartData = [
  ['age', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  ['GOrbitalAverage', 100, 105, 110, 113, 117, 122, 127, 129, 130, 133, 140, 145, 145,
    145, 146, 146, 144, 142],
  ['GOrbitalPatient', null, null, 120, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null],
  ['SCentralAverage', 200, 204, 208, 213, 217, 222, 225, 227, 230, 231, 237, 237, 237,
    237, 237, 234, 234, 232],
  ['SCentralPatient', null, null, 190, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null]
];

const defaultChartData = [
  ['age', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  ['GOrbitalAverage', 100, 105, 110, 113, 117, 122, 127, 129, 130, 133, 140, 145, 145,
    145, 146, 146, 144, 142],
  ['GOrbitalPatient', null, null, 120, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null]
];

const xAxis = ['age', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];


class VolumeGrowth extends React.Component<ComponentProps, ComponentState> {
  constructor(props : ComponentProps) {
    super(props);

    this.state = {
      pushedSegments: []
    };

    this.changeData = this.changeData.bind(this);
  }

  componentDidMount() {
    this.renderChart(defaultChartData);
  }

  renderChart(inputChart: any) {
    var chart = c3.generate({
      data: {
        x: 'age',
        columns: inputChart,
        type: 'spline',
        colors: {
            GOrbitalAverage: '#FFA500',
            GOrbitalPatient: '#FFA500',
            SCentralAverage: '#00BFFF',
            SCentralPatient: '#00BFFF'
        }
      },
      padding: {
        top: 30,
        bottom: 20
      },
      axis: {
        x: {
            label: {
                text: 'Age in Months',
                position: 'outer-center'
            }
        },
        y: {
            label: {
                text: 'Size in cm3',
                position: 'outer-middle'
            }
        }
      },
      tooltip: {
        format: {
            title: function (d) { return d + ' Months old'; },
        }
      }
    });
  }

  getSegmentData(segment: string){
    var segmentData = chartData.find(function(segmentData) {
      return (segmentData[0] === segment);
    });
    return segmentData;
  }

  setFilter() {
    var filteredData : any[] = [];
    // Get the Patient data for the segment
    if(this.state.pushedSegments.length > 0) {
        filteredData = this.state.pushedSegments.map(segment =>
          this.getSegmentData(segment+'Patient'));
    }
    // Get the Average data for the segment
    if(this.state.pushedSegments.length > 0) {
        filteredData = filteredData.concat(this.state.pushedSegments.map(segment =>
          this.getSegmentData(segment+'Average')));
    }
    filteredData.push(xAxis);
    return filteredData;
  }

  changeData(selectedSegments: any) {
    // Call back function to avoid asynchronous setState
    var processedData;
    this.setState({
      pushedSegments : selectedSegments
    }, () => {
      //Input processing
      processedData = this.setFilter();
      this.renderChart(processedData);
    });
  }

  render() {
    return(
      <div>
        <React.Fragment>
          <Typeahead
            clearButton
            defaultSelected={['GOrbital']}
            id="selector"
            multiple
            options={['GOrbital', 'SCentral']}
            placeholder="Choose a brain segment..."
            onChange={(selectedSegments) => this.changeData(selectedSegments)}
          />
        </React.Fragment>
        <div id="chart"></div>
      </div>
    );
  }
}

export default VolumeGrowth;
