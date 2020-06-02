$(document).on("mousemove", (e) => {
  $("#our_tooltip").css({
    left: e.pageX + 15,
    top: e.pageY - 20,
  });
});
const FF = {
  titleCase: (string) => {
    var sentence = string.toLowerCase().split(" ");
    for (var i = 0; i < sentence.length; i++) {
      sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
    }
    return sentence.join(" ");
  },
  randomNumber: (min, max) => {
    return Math.random() * (max - min) + min;
  },
  humRead: d3.format(",d"),
  uniqueId: () => {
    return "_" + Math.random().toString(36).substr(2, 9);
  },
};

function drawMap(column) {
  var myColor = 0;
  if (column == "Total_Overall_PIN") {
    myColor = d3
      .scaleLinear()
      .domain([1, 10000, 100000, 900000])
      .range(["white", "#d0f3d0", "#248efa", "#002b57"]);
  } else {
    myColor = d3
      .scaleLinear()
      .domain([1, 1000, 100000, 700000])
      .range(["white", "#e9daaf", "#fdb119", "#714c00"]);
  }

  d3.json("data/ETH_adm2-mapshaper.json").then(function (geodata) {
    function getColor(d) {
      d = _bigdata[d][column];
      return myColor(d);
      // return d > 800000
      //   ? "#800026"
      //   : d > 500000
      //   ? "#BD0026"
      //   : d > 100000
      //   ? "#E31A1C"
      //   : d > 50000
      //   ? "#FC4E2A"
      //   : d > 10000
      //   ? "#FD8D3C"
      //   : d > 1000
      //   ? "#FEB24C"
      //   : d > 100
      //   ? "#FED976"
      //   : "#FFEDA0";
    }

    function style(feature) {
      return {
        weight: 0.5,
        opacity: 1,
        color: "black",
        dashArray: 0,
        fillOpacity: 0.9,
        fillColor: getColor(feature.properties.ADM2_PCODE),
      };
    }

    function highlightFeature(e) {
      var layer = e.target;

      layer.setStyle({
        weight: 5,
        color: "#666",
        dashArray: "",
        fillOpacity: 0.7,
      });
      let getnum = _bigdata[layer.feature.properties.ADM2_PCODE][column];
      let getv1 =
        _bigdata[layer.feature.properties.ADM2_PCODE]["cluster-v4_Agriculture"];
      let getv2 =
        _bigdata[layer.feature.properties.ADM2_PCODE]["cluster-v4_Education"];
      let getv3 =
        _bigdata[layer.feature.properties.ADM2_PCODE]["cluster-v4_ESNFI"];
      let getv4 =
        _bigdata[layer.feature.properties.ADM2_PCODE]["cluster-v4_Health"];
      let getv5 =
        _bigdata[layer.feature.properties.ADM2_PCODE]["cluster-v4_Food"];
      let getv6 =
        _bigdata[layer.feature.properties.ADM2_PCODE]["cluster-v4_Nutrition"];
      let getv7 =
        _bigdata[layer.feature.properties.ADM2_PCODE]["cluster-v4_Protection"];
      let getv8 =
        _bigdata[layer.feature.properties.ADM2_PCODE]["cluster-v4_WASH"];

      getv1 = getv1 ? FF.humRead(getv1) : "-";
      getv2 = getv2 ? FF.humRead(getv2) : "-";
      getv3 = getv3 ? FF.humRead(getv3) : "-";
      getv4 = getv4 ? FF.humRead(getv4) : "-";
      getv5 = getv5 ? FF.humRead(getv5) : "-";
      getv6 = getv6 ? FF.humRead(getv6) : "-";
      getv7 = getv7 ? FF.humRead(getv7) : "-";
      getv8 = getv8 ? FF.humRead(getv8) : "-";

      $("#our_tooltip").show();
      $("#our_tooltip").html(
        "<b>" +
          FF.titleCase(layer.feature.properties.ADM2_EN) +
          ", " +
          FF.titleCase(layer.feature.properties.ADM1_EN) +
          "</b><br/><table class='mt-2'>" +
          "<tr><td>" +
          column +
          "</td><td>:</td><td>" +
          FF.humRead(getnum) +
          "</td></tr>" +
          "<tr><td><b><u>cluster v4</u><b></td><td></td><td></td></tr>" +
          "<tr><td>Agriculture</td><td>:</td><td>" +
          getv1 +
          "</td></tr>" +
          "<tr><td>Education</td><td>:</td><td>" +
          getv2 +
          "</td></tr>" +
          "<tr><td>ESNFI</td><td>:</td><td>" +
          getv3 +
          "</td></tr>" +
          "<tr><td>Health</td><td>:</td><td>" +
          getv4 +
          "</td></tr>" +
          "<tr><td>Food</td><td>:</td><td>" +
          getv5 +
          "</td></tr>" +
          "<tr><td>Nutrition</td><td>:</td><td>" +
          getv6 +
          "</td></tr>" +
          "<tr><td>Protection</td><td>:</td><td>" +
          getv7 +
          "</td></tr>" +
          "<tr><td>WASH</td><td>:</td><td>" +
          getv8 +
          "</td></tr>" +
          "</table>"
      );
      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
      }
    }
    var geojson;

    function resetHighlight(e) {
      $("#our_tooltip").hide();
      geojson.resetStyle(e.target);
    }

    function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature,
      });
    }

    geojson = L.geoJson(geodata, {
      style: style,
      onEachFeature: onEachFeature,
    });

    if (column == "Total_Overall_PIN") {
      _layerControl.addOverlay(geojson, "Total overall PIN");
    } else {
      _layerControl.addOverlay(geojson, "Total wellbeing PIN");
    }
  });
}
$(".areaselection").on("change", function () {
  let val = $(this).val();
  $(".areaselection option:selected").prop("selected", false);
  $(".areaselection option[value='" + val + "']").prop("selected", true);
  prosesschart(val);
});

function prosesschart(val) {
  let data2 = [];
  let categories2 = [];
  let thedata2 = [];

  let data3 = [0, 0, 0, 0, 0, 0, 0, 0];
  let categories3 = [
    "Agriculture",
    "Education",
    "ESNFI",
    "Health",
    "Food",
    "Nutrition",
    "Protection",
    "WASH",
  ];

  let categories1 = [];
  let series = [
    { name: "PIN_Boys", data: [] },
    { name: "PIN_MaleAdults", data: [] },
    { name: "PIN_MaleElderly", data: [] },
    { name: "PIN_Girls", data: [] },
    { name: "PIN_FemaleAdults", data: [] },
    { name: "PIN_FemaleElderly", data: [] },
  ];
  $("#areasub").html("");
  for (x in _bigdata) {
    if (_bigdata[x]["ADM1_EN"] == val) {
      $("#areasub").append(
        "<option value='" +
          _bigdata[x]["ADM2_EN"] +
          "'>" +
          _bigdata[x]["ADM2_EN"] +
          "</option>"
      );

      // for chart1
      categories1.push(_bigdata[x]["ADM2_EN"]);
      series[0].data.push(Math.round(Number(_bigdata[x]["PIN_Boys"])));
      series[1].data.push(Math.round(Number(_bigdata[x]["PIN_MaleAdults"])));
      series[2].data.push(Math.round(Number(_bigdata[x]["PIN_MaleElderly"])));
      series[3].data.push(Math.round(Number(_bigdata[x]["PIN_Girls"])));
      series[4].data.push(Math.round(Number(_bigdata[x]["PIN_FemaleAdults"])));
      series[5].data.push(Math.round(Number(_bigdata[x]["PIN_FemaleElderly"])));

      // for chart2
      thedata2.push([
        _bigdata[x]["ADM2_EN"],
        Math.round(Number(_bigdata[x]["PIN_Disability"])),
      ]);

      //for chart3
      if (_bigdata[x]["ADM2_EN"] == $("#areasub").val()) {
        console.log(_bigdata[x]["cluster-v4_Agriculture"]);
        data3[0] += Math.round(Number(_bigdata[x]["cluster-v4_Agriculture"]));
        data3[1] += Math.round(Number(_bigdata[x]["cluster-v4_Education"]));
        data3[2] += Math.round(Number(_bigdata[x]["cluster-v4_ESNFI"]));
        data3[3] += Math.round(Number(_bigdata[x]["cluster-v4_Health"]));
        data3[4] += Math.round(Number(_bigdata[x]["cluster-v4_Food"]));
        data3[5] += Math.round(Number(_bigdata[x]["cluster-v4_Nutrition"]));
        data3[6] += Math.round(Number(_bigdata[x]["cluster-v4_Protection"]));
        data3[7] += Math.round(Number(_bigdata[x]["cluster-v4_WASH"]));
      }
    }
  }
  thedata2.sort(function (a, b) {
    return b[1] - a[1];
  });
  thedata2.forEach(function (d) {
    categories2.push(d[0]);
    data2.push(d[1]);
  });
  data3.forEach(function (d, i) {
    if (!d) {
      data3[i] = 0;
    }
  });
  chart1(series, categories1);
  chart2(data2, categories2);
  console.log(val, data3, categories3);
  chart3(val, data3, categories3);
}

$("#areasub").on("change", function (d, i) {
  let data3 = [0, 0, 0, 0, 0, 0, 0, 0];
  let categories3 = [
    "Agriculture",
    "Education",
    "ESNFI",
    "Health",
    "Food",
    "Nutrition",
    "Protection",
    "WASH",
  ];
  let val = $("#area3").val();

  for (x in _bigdata) {
    if (_bigdata[x]["ADM1_EN"] == val) {
      //for chart3
      if (_bigdata[x]["ADM2_EN"] == $("#areasub").val()) {
        console.log(_bigdata[x]["cluster-v4_Agriculture"]);
        data3[0] += Math.round(Number(_bigdata[x]["cluster-v4_Agriculture"]));
        data3[1] += Math.round(Number(_bigdata[x]["cluster-v4_Education"]));
        data3[2] += Math.round(Number(_bigdata[x]["cluster-v4_ESNFI"]));
        data3[3] += Math.round(Number(_bigdata[x]["cluster-v4_Health"]));
        data3[4] += Math.round(Number(_bigdata[x]["cluster-v4_Food"]));
        data3[5] += Math.round(Number(_bigdata[x]["cluster-v4_Nutrition"]));
        data3[6] += Math.round(Number(_bigdata[x]["cluster-v4_Protection"]));
        data3[7] += Math.round(Number(_bigdata[x]["cluster-v4_WASH"]));
      }
    }
  }

  data3.forEach(function (d, i) {
    if (!d) {
      data3[i] = 0;
    }
  });

  chart3(val, data3, categories3);
});
// fungsi untuk menggambar chart pertama
function chart1(series, categories) {
  if (_stackChart) {
    _stackChart.destroy();
  }

  var options = {
    series: series,
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
    },

    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          enabled: false,
          show: false,
          position: "none",
        },
      },
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    title: {
      text: "Population per area",
    },
    xaxis: {
      categories: categories,
      labels: {
        formatter: function (val) {
          return val;
        },
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + "K";
        },
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      offsetX: 40,
    },
  };

  _stackChart = new ApexCharts(document.querySelector("#myAreaChart"), options);
  _stackChart.render();
}

// fungsi chart kedua
function chart2(data, categories) {
  if (_barChart) {
    _barChart.destroy();
  }

  var options = {
    series: [
      {
        data: data,
      },
    ],
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
    },
  };

  _barChart = new ApexCharts(document.querySelector("#myBarChart"), options);
  _barChart.render();
}

function chart3(area, series, categories) {
  if (_radarChart) {
    _radarChart.destroy();
  }
  var options = {
    series: [
      {
        name: area,
        data: series,
      },
    ],
    chart: {
      height: 350,
      type: "radar",
    },
    xaxis: {
      categories: categories,
    },
  };
  _radarChart = new ApexCharts(
    document.querySelector("#myRadarChart"),
    options
  );
  _radarChart.render();
}

// Add active state to sidbar nav links
var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
$("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function () {
  if (this.href === path) {
    $(this).addClass("active");
  }
});

// Toggle the side navigation
$("#sidebarToggle").on("click", function (e) {
  e.preventDefault();
  $("body").toggleClass("sb-sidenav-toggled");
});
