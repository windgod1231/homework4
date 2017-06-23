//2d散佈圖
var create_2dScatter = function (dataSet, dataSetting) {
    // 1. 定義width, height, padding, letterList變數
    var w2 = 900;
    var h2 = 600;
    var p2 = 80;
    var tooltip;

    //欄位資料設定
    for (var i in dataSetting) {
        this[i] = dataSetting[i];
    }

    //2. 建立svg()畫布環境
    var myDiv = d3.select("body").append("div")
        .style({
            position: "relative"
        });

    var mySVG = createSVG(myDiv);

    bind(dataSet);
    render(dataSet);
    btnList(dataSet);

    //建立SVG
    function createSVG(target) {

        var selection = target.append("svg").attr({
            width: w2,
            height: h2
        });
        selection.append("g").append("rect").attr({
            width: "100%",
            height: "100%",
            fill: "white"
        });

        selection.append("g").attr({
            id: "axisX"
        });
        selection.append("g").attr({
            id: "axisY"
        });

        //產生tooltip
        tooltip = target.append("div").classed("tooltip", true).classed("hidden", true);
        tooltip.append("p").append("strong").classed("sData1", true);
        tooltip.append("p").classed("sData2", true);

        return selection;
    }


    //建立bind()
    function bind(dataSet) {
        var selection = mySVG
            .selectAll('circle')
            .data(dataSet);

        selection.enter().append("circle");
        selection.exit().remove();
    }


    //開始畫圖 render
    function render(dataSet) {
        //5. 定義xScale,yScale,rScale, fScale比例尺
        var xScale = d3.time.scale()
            .domain([
                        new Date(d3.min(dataSet, function (d) {
                    return d[xData];
                })),
                        new Date(d3.max(dataSet, function (d) {
                    return d[xData];
                }))
                    ])
            .range([p2, w2 - p2]);

        var yScale = d3.scale.linear()
            .domain([0, d3.max(dataSet, function (d) {
                return d[yData];
            })])
            .range([h2 - p2, p2]);

        var rScale = d3.scale.linear()
            .domain([
                        d3.min(dataSet, function (d) {
                    return d[rData];
                }),
                        d3.max(dataSet, function (d) {
                    return d[rData];
                }),
                    ])
            .range([5, 30]);

        var fScale = d3.scale.category20();

        // 座標軸 axis X ----------------------
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(20);

        mySVG.select("g#axisX")
            .attr({
                'class': 'axis'
            })
            .attr("transform", "translate(0," + (h2 - p2 + 12) + ")")
            .call(xAxis);

        // 座標軸 axis Y -----------------------
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(20)
            .tickFormat(function (d) {
                return d / 1000000 + "M";
            });

        mySVG.select("g#axisY")
            .attr({
                'class': 'axis'
            })
            .attr("transform", "translate(" + (p2 - 12) + "," + (0) + ")")
            .call(yAxis);


        //6. 建立render()繪圖
        mySVG.selectAll("circle")
            .attr({
                cx: function (d) {
                    return xScale(new Date(d.date));
                },
                cy: function (d) {
                    return yScale(d[yData]);
                },
                r: function (d) {
                    return rScale(d[rData]);
                },
                fill: function (d) {
                    return fScale(d[sData1]);
                }
            }).on("mouseover", function (d) {
                var posX = +d3.select(this).attr("cx");
                var posY = +d3.select(this).attr("cy");

                tooltip.classed("hidden", false);
                tooltip.select(".sData1").text(function () {
                    return d[sData1];
                });
                tooltip.select(".sData2").text(function () {
                    return d[sData2];
                });

                var tooltip_w = +tooltip.style("width").substr(0, tooltip.style("width").length - 2);
                var tooltip_h = +tooltip.style("height").substr(0, tooltip.style("height").length - 2);

                var left = (posX > w2 - tooltip_w - 20) ? posX - tooltip_w - 20 : posX + 20;
                var top = (posY > h2 - tooltip_h - 20) ? posY - tooltip_h - 20 : posY + 20;
                tooltip.style({
                    left: (left) + "px",
                    top: (top) + "px"
                })

            }).on("mouseout", function () {
                tooltip.classed("hidden", true);
            });
    }


    //更新
    function update(sData2_name) {
        console.log("sData2_name:" + sData2_name);
        console.log("sData2:" + sData2);
        var newDataSet = dataSet.filter(function (d) {
            //console.log(d[sData2]);
            return d[sData2] == sData2_name;
        });
        bind(newDataSet);
        render(newDataSet);
    }


    //產生下拉選單
    function btnList(dataSet) {
        var sData2Arr = dataSet.map(function (d) {
            return d[sData2];
        });

        var sData2Arr_uniq = unique(sData2Arr).filter(function (d) {
            return d != "";
        });

        sData2Arr_uniq.unshift("全部類別");
        console.log(sData2Arr_uniq);

        //產生選單
        var mySelect = myDiv.append("select");

        var myOption = mySelect.selectAll("option")
            .data(sData2Arr_uniq);
        myOption.enter().append("option");
        myOption.exit().remove();

        //------- render -------
        mySelect.selectAll("option")
            .attr({
                value: function (d) {
                    return d;
                }
            })
            .text(function (d) {
                return d;
            });


        //                mySelect
        //                    .insert("option", ":first-child")
        //                    .attr({
        //                        value: "全部類別",
        //                        select: "selected"
        //                    })
        //                    .text("全部類別");

        //綁定select切換事件
        mySelect.on("change", function (d) {
            var value = mySelect.property("value");
            console.log(value);

            if (value == "全部類別") {
                bind(dataSet);
                render(dataSet);
            } else {
                update(value);
            }


        });

    }
}


//陣列移除重複
function unique(array) {
    var n = [];
    for (var i = 0; i < array.length; i++) {
        if (n.indexOf(array[i]) == -1)
            n.push(array[i]);
    }
    return n;
}
