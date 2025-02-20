import React from "react"
import { Link } from 'react-router'
import _ from "underscore"

import PieChart from "../pie_chart.jsx"
import Icon from "./icon.jsx"

let Statistics = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
    },

    render: function () {
        var coverageData = this.props.node.quality.coverage ? this.props.node.quality.coverage.data : null

        return (<div className="row">
            <div className="col-sm-6 col-xs-12">
                <h4>Worst Files</h4>
                <ul className="list-unstyled">
                    {_.map(this.props.node.worst, function (item) {
                        return (<li key={item.node.path}>
                            <Link to={{ pathname: "/source", query: { file: item.node.path } }}>
                                <Icon quality={item.index} /> {item.node.name} ({item.index.toFixed(2)})
                            </Link><br />
                            <small>{item.node.path}</small>
                        </li>)
                    })}
                </ul>
            </div>
            <div className="col-sm-6 col-xs-12">
                {'size' in this.props.node.quality ? <div>
                    <h4>Size</h4>
                    <dl className="dl-horizontal">
                        <dt>Files</dt><dd className="text-right">{this.props.node.quality.size.data.files}</dd>
                        <dt>Classes</dt><dd className="text-right">{this.props.node.quality.size.data.classes}</dd>
                        <dt>Methods</dt><dd className="text-right">{this.props.node.quality.size.data.methods}</dd>
                        <dt>Lines</dt><dd className="text-right">{this.props.node.quality.size.data.lines}</dd>
                    </dl>
                </div> : null}

                {coverageData ? <div>
                    <h4>Lines Covered</h4>
                    <PieChart
                        id="chart-loc"
                        title={(coverageData.covered / coverageData.count * 100).toFixed(2) + "%"}
                        classes={["uncovered", "covered"]}
                        values={[
                            { label: "uncovered", value: coverageData.count - coverageData.covered },
                            { label: "covered", value: coverageData.covered },
                        ]} />
                </div> : null}
            </div>
        </div>)
    },
})

export default Statistics
