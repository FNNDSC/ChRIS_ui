import * as React from 'react';
import * as c3 from 'c3';
import { Typeahead } from "react-bootstrap-typeahead";

const graphData = [
  ['leftHemisphere', 30, -20, 10, 40, -15, 25],
  ['rightHemisphere', 34, -16, 14, 44, -11, 20]
];

const regions = ['G_and_S_frontomargin', 'G_orbital', 'G_temporal_middle',
                    'S_central', 'S_front_sup', 'S_temporal_inf'];

class SegmentAnalysis extends React.Component {
  componentDidMount() {
    var chart = c3.generate({
      data: {
        columns: graphData,
        type: 'bar',
        colors: {
            leftHemisphere: '#FFA500',
            rightHemisphere: '#00BFFF'
        }
      },
      axis: {
        x: {
            type: 'category',
            categories: regions,
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

  render() {
    return (
      <div>
        <React.Fragment>
          <Typeahead
            id="selector"
            multiple
            options={['Segment1', 'Segment2', 'Segment3']}
            placeholder="Choose a brain segment..."
            onChange={(e) => console.log(e)}
          />
        </React.Fragment>
        <div id="chart"></div>
      </div>
    );
  }
}

export default SegmentAnalysis;
