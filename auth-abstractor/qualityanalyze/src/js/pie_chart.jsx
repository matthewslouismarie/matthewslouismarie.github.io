import React from 'react'
import d3 from "d3"

let PieChart = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
    },

    getInitialState: function () {
        return {
            id: Math.random().toString(36).substring(2, 8),
        }
    },

    getDefaultProps: function () {
        return {
            title: null,
            id: null,
            values: [
                { label: "One", value: 33 },
                { label: "Two", value: 45 },
            ],
            classes: ["slice-1", "slice-2", "slice-3", "slice-4", "slice-5"],
        }
    },

    componentDidMount: function () {
        this.create(this.getChartElement(), this.props)
    },

    componentDidUpdate: function () {
        this.update(this.getChartElement(), this.props)
    },

    componentWillUnmount: function () {
        this.destroy(this.getChartElement())
    },

    getChartElement: function () {
        return document.getElementById(this.props.id || this.state.id)
    },

    svg: null,

    create: function (element, state) {
        this.svg = d3.select(element).append('svg')
            .attr('class', 'd3')
            .attr('width', element.offsetWidth)
            .attr('height', element.offsetHeight)

        this.svg.append('g')
            .attr('class', 'slices')
        this.svg.append('g')
            .attr('class', 'titles')

        this.update(element, state)
    },

    update: function (element, state) {
        this._drawSlices(element, state)
        this._drawTitle(element, state)
    },

    destroy: function (element) {
    },

    _drawSlices: function (element, state) {
        var g = d3.select(element).selectAll(".slices")
        var height = this.svg.attr("height")
        var width = this.svg.attr("width")
        var radius = Math.min(height, width) / 2
        var arc = d3.svg.arc().innerRadius(radius * 0.5).outerRadius(radius).padAngle(0.02)
        var pie = d3.layout.pie().sort(null).value(function (slice) { return slice.value })
        var classes = d3.scale.ordinal().range(state.classes)

        var slice = g.selectAll(".slice").data(pie(state.values))
        var newSlice = slice.enter()
        var group = newSlice.append("g")

        g.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

        // New slice
        group
            .attr("class", "slice")

        group
            .append("path")
            .attr("class", function (slice, count) { return classes(count) })
            .attr("d", arc)
            .each(function (slice) { this._current = slice })

        group
            .append("text")
            .attr("transform", function (slice, count) { return "translate(" + arc.centroid(slice, count) + ")" })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("class", "label")

        // Update existing slice
        slice.select("path").transition().duration(500)
            .attrTween("d", function (slice) {
                var interpolator = d3.interpolate(this._current, slice)
                this._current = interpolator(0)
                return function (t) {
                    return arc(interpolator(t))
                }
            })

        slice.select("text")
            .attr("transform", function (slice, count) { return "translate(" + arc.centroid(slice, count) + ")" })
            .text(function (slice) { return slice.value })

        // Exiting slice
        slice.exit().remove()
    },

    _drawTitle: function (element, state) {
        var g = d3.select(element).selectAll(".titles")
        var height = this.svg.attr("height")
        var width = this.svg.attr("width")

        var title = g.selectAll(".title").data([state.title], function (title) { return title })
        var newTitle = title.enter()

        // New title
        newTitle
            .append("text")
            .attr("class", "title")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(state.title)

        // Update title
        title.select(".title")
            .text(function (title) { return title })

        // Exiting title
        title.exit().remove()
    },

    render: function () {
        return (<div className="pie-chart" id={this.props.id || this.state.id} ></div>)
    },
})

export default PieChart
