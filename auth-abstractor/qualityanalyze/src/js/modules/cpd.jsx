import React from "react"
import _ from "underscore"

import Duplication from './cpd/duplication.jsx'

let CPD = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
    },

    render: function () {
        var baseDir = this.props.data.baseDir

        return (<div className="row">
            <div className="col-md-12">
                <h2>Code Duplications</h2>
                {!this.props.data.analyzers.cpd["pmd-cpd"].duplication ?
                    <h3>No violations</h3> :
                    <ul className="list-unstyled list-hover">
                        {_.map(this.props.data.analyzers.cpd["pmd-cpd"].duplication, function (duplication, key) {
                            return (<Duplication key={key} baseDir={baseDir} duplication={duplication} />)
                        })}
                    </ul>
                }
            </div>
        </div>)
    },
})

export default CPD
