import { useD3 } from './hooks/useD3';
import React from 'react';
import * as d3 from 'd3';
import data from './data_files/food_insecurity_bubble_data.csv';

export class BubbleHelp {
    constructor(svg, width, height, type="cari") {
        // set the dimensions and margins of the graph
        this.width = width
        this.height = height
        this.type = type;

// append the svg object to the body of the page
        this.svg = svg
            // .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
    }
    initialize_nodes(data) {
        this.data = data
        // A scale that gives a X target position for each group
        this.x_centers = d3.scaleOrdinal()
            .domain([4, 3, 2, 1])
            .range([this.width/10, this.width*3.5/10, this.width*6.5/10, this.width*9/10])


        // A color scale
        var color_cari = d3.scaleOrdinal()
            .domain([4, 3, 2, 1])
            .range(["#cb0f00", "#ff746c", "#24c6f3", "#0443a6"])

        var color_aid = d3.scaleOrdinal()
            .domain([false, true])
            .range(["#d52719", "#0443a6"])

        this.bubble_stroke_width = 1.5

        this.radius_size = this.width/130;

        // Initialize the circle: located at the center of each group area
        this.node = this.svg.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", this.radius_size)
            .attr("cx", this.width / 2)
            .attr("cy", this.height / 2)
            .style("fill", function (d) {
                if (this.type == "cari"){
                    return color_cari(d.group)
                } else {
                    return color_aid(d.aid)
                }
            }.bind(this))
            .style("fill-opacity", 0.8)
            .attr("stroke", "black")
            .style("stroke-width", this.bubble_stroke_width)
        // .call(d3.drag() // call specific function when circle is dragged
        //     .on("start", dragstarted)
        //     .on("drag", dragged)
        //     .on("end", dragended));

// Features of the forces applied to the nodes:
        this.simulation = d3.forceSimulation()
            .force("x", d3.forceX().strength(0.15).x(function (d) {
                if (d.group <3){
                    return this.width*0.57
                } else {
                    return this.width *0.42
                }
            }.bind(this)))
            .force("y", d3.forceY().strength(0.1).y(function(d){
                if (this.type == "cari") {
                    return this.height / 2
                } else {
                    if (d.aid) {
                        return this.height * 3.9 / 9
                    } else {
                        return this.height * 5.1 / 9
                    }
                }
            }.bind(this)))
            // .force("center", d3.forceCenter().x(this.width / 2).y(this.height / 2)) // Attraction to the center of the svg area
            .force("charge", d3.forceManyBody().strength(0.5)) // Nodes are attracted one each other of value is > 0
            .force("collide", d3.forceCollide().strength(0.5).radius(function (d){
                return this.radius_size + this.bubble_stroke_width/2
            }.bind(this)).iterations(2)) // Force that avoids circle overlapping

// Apply these forces to the nodes and update their positions.
// Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
        this.simulation
            .nodes(data)
            .on("tick", function (d) {
                this.node
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    })
            }.bind(this))
            .on("end", function (){
                console.log("finished")
                this.move_nodes(this.data)
            }.bind(this));

    }
    move_nodes(data) {
        // Features of the forces applied to the nodes:
        this.simulation = d3.forceSimulation()
            .force("x", d3.forceX().strength(0.1).x(function (d) {
                return this.x_centers(d.group)
            }.bind(this)))
            .force("y", d3.forceY().strength(0.06).y(function(d){
                if (this.type == "cari") {
                    return this.height / 2
                } else {
                    if (d.aid) {
                        return this.height * 3.5 / 9
                    } else {
                        return this.height * 5.5 / 9
                    }
                }
            }.bind(this)))
            // .force("center", d3.forceCenter().x(this.width / 2).y(this.height / 2)) // Attraction to the center of the svg area
            .force("charge", d3.forceManyBody().strength(0.1)) // Nodes are attracted one each other of value is > 0
            .force("collide", d3.forceCollide().strength(1.0).radius(function (d){
                return this.radius_size + this.bubble_stroke_width/2
            }.bind(this)).iterations(2))
            .alpha(0.6)// Force that avoids circle overlapping


// Apply these forces to the nodes and update their positions.
// Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
        this.simulation
            .nodes(data)
            .on("tick", function (d) {
                this.node
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    })
            }.bind(this));

        // x axis labels
        let sectors = ["Severe Insecurity", "Moderate Insecurity",  "Marginal Security", "Secure"]
        let xScale = d3
            .scaleBand()
            .domain(sectors)
            .range([0, this.width]);

        var x_axis = d3.axisTop()
            .scale(xScale);

        var xAxisTranslate = this.height-50;
        this.svg.append("g")
            .attr("transform", "translate(0, " + xAxisTranslate  +")")
            .call(x_axis)
            .append("text")
            .attr("font-size","18")
            .attr("fill", "black")
            .attr("x", (this.width / 2))
            .attr("y", 20) //set your y attribute here
            .style("text-anchor", "middle")
            .text("Food Security Category");


        // bubble count labels
        let bubble_counts = [ "3.3M", "10.7M", "30.3M", "7.2M"]
        let lScale = d3
            .scaleBand()
            .domain(bubble_counts)
            .range([0, this.width]);
        var l_axis = d3.axisBottom()
            .scale(lScale)
        var lAxisTranslate = 50;
        this.svg.append("g")
            .attr("transform", "translate(0, " + lAxisTranslate  +")")
            .call(l_axis)
            .append("text")
            .attr("font-size","18")
            .attr("fill", "black")
            .attr("x", (this.width / 2))
            .attr("y", -10) //set your y attribute here
            .style("text-anchor", "middle")
            .text("Total Population in Category");

    }

}
function BubbleChart() {
    const ref = useD3(
        (svg) => {
            var plot_data = [];

            d3.csv(data, function(data) {
                plot_data.push({"size": 100, "group": Math.round(data.cari)})
            }).then(function (){
                // var svgt = d3.select("svg");
                svg.selectAll("*").remove();
                console.log(plot_data);
                let width = 1000;
                let height = 500;
                let BC = new BubbleHelp(svg, width, height, "cari")
                BC.initialize_nodes(plot_data)
            });
        },
        [1]
    );

    return (
        <svg
            ref={ref}
            style={{
                height: 500,
                width: "100%",
                marginRight: "0px",
                marginLeft: "0px",
            }}
        >
            <g className="plot-area" />
            <g className="x-axis" />
            <g className="y-axis" />
        </svg>
    );
}


export default BubbleChart;