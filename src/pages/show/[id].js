import React, { useRef, useEffect, useState } from "react";
import { promises as fs } from "fs";
import csv from "neat-csv";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  TextField,
  Menu,
  MenuItem,
} from "@mui/material";
import GroupFactors from "@/components/GroupFactors";

import { Graph } from "../../components/Graph";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { NotValid } from "@/components/NotValid";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyOTEzOTg4ZS1jOTliLTQzNDMtOGEzNy1hY2NlZjU1MmY0MzQiLCJpZCI6MTI0NjIzLCJpYXQiOjE2NzYzNjI0Mzl9.6gEmu5IXcAMGVjAmVbmgo0A3yLU-I28xBCyXRc6CZns";

function computeCircle(radius) {
  const positions = [];
  for (let i = 0; i < 360; i++) {
    const radians = Cesium.Math.toRadians(i);
    positions.push(
      new Cesium.Cartesian2(
        radius * Math.cos(radians),
        radius * Math.sin(radians)
      )
    );
  }
  return positions;
}

export default function Wrapper(props) {
  if (props.is_valid) {
    return <ShowMap {...props}/>
  } else {
    return <NotValid />
  }
}

function ShowMap(props) {
  const checkpointRef = useRef(false);
  const [startValue, setStartValue] = useState("");
  const [stopValue, setStopValue] = useState("");
  const [phase, setPhase] = useState([]);
  const [datasetStart, setDatasetStart] = useState(0);
  const [datasetStop, setDatasetStop] = useState(props.x_axis.length - 1);
  const [showTitleGraph, setShowTitleGraph] = React.useState("???");
  const [showGraph, setShowGraph] = React.useState(null);
  const [counter, setCounter] = useState(0);

  const [viewer, setViewer] = useState();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [correlation, setCorrelation] = useState([]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  let inputCounter = 0;

  const handleTextChangeStart = (event) => {
    setStartValue(event.target.value);
  };
  const handleTextChangeEnd = (event) => {
    setStopValue(event.target.value);
  };
  const handleSelect = (selected) => {
    let dataset = datasetsMap[selected];
    setShowTitleGraph(dataset.title);
    setShowGraph(
      <Graph
        datasets={dataset.datasets}
        labels={props.time_us.slice(datasetStart, datasetStop + 1)}
      />
    );
    handleClose();
  };

  const groups = [
    {
      topic: "Energy",
      color: "#faeba2",
      data: [{ key: "VoltCurr", value: correlation[0] }],
    },
    {
      topic: "Throttle",
      color: "#faeba2",
      data: [{ key: "RCOut", value: correlation[1] }],
    },
    {
      topic: "Altitude",
      color: "#bef7bf",
      data: [
        { key: "DAlt", value: correlation[2] },
        { key: "Alt", value: correlation[3] },
      ],
    },
    {
      topic: "Climb Rate",
      color: "#bef7bf",
      data: [
        { key: "ClimbRate", value: correlation[4] },
        { key: "CRt", value: correlation[5] },
      ],
    },
    {
      topic: "Speed",
      color: "#bef7bf",
      data: [{ key: "ASPD", value: correlation[6] }],
    },
    {
      topic: "Pitch",
      color: "#b3f6fc",
      data: [{ key: "NavPitch", value: correlation[7] }],
    },
    {
      topic: "Roll",
      color: "#b3f6fc",
      data: [
        { key: "DesRoll", value: correlation[8] },
        { key: "Roll", value: correlation[9] },
      ],
    },
    {
      topic: "Yaw",
      color: "#b3f6fc",
      data: [
        { key: "Yaw", value: correlation[10] },
        { key: "DesYaw", value: correlation[11] },
      ],
    },
    {
      topic: "Rudder",
      color: "#b3f6fc",
      data: [{ key: "RdrOut", value: correlation[12] }],
    },
    {
      topic: "Angle",
      color: "#b3f6fc",
      data: [
        { key: "AOA", value: correlation[13] },
        { key: "SSA", value: correlation[14] },
      ],
    },
    {
      topic: "Wind",
      color: "#f7dff7",
      data: [
        { key: "North", value: correlation[15] },
        { key: "East", value: correlation[16] },
      ],
    },
  ];

  function corrcal() {
    // Suppose we have two arrays of data
    let x = [];
    x.push(props.volt_curr.slice(datasetStart, datasetStop + 1));
    x.push(props.rcou_c9.slice(datasetStart, datasetStop + 1));
    x.push(props.qtun_dalt.slice(datasetStart, datasetStop + 1));
    x.push(props.qtun_alt.slice(datasetStart, datasetStop + 1));
    x.push(props.tecs_dh.slice(datasetStart, datasetStop + 1));
    x.push(props.baro_crt.slice(datasetStart, datasetStop + 1));
    x.push(props.arsp_arsp.slice(datasetStart, datasetStop + 1));
    x.push(props.ctun_nvap.slice(datasetStart, datasetStop + 1));
    x.push(props.att_desroll.slice(datasetStart, datasetStop + 1));
    x.push(props.att_roll.slice(datasetStart, datasetStop + 1));
    x.push(props.att_yaw.slice(datasetStart, datasetStop + 1));
    x.push(props.att_desyaw.slice(datasetStart, datasetStop + 1));
    x.push(props.ctun_rdr.slice(datasetStart, datasetStop + 1));
    x.push(props.aoa_aoa.slice(datasetStart, datasetStop + 1));
    x.push(props.aoa_ssa.slice(datasetStart, datasetStop + 1));
    x.push(props.nkf_vwn.slice(datasetStart, datasetStop + 1));
    x.push(props.nkf_vwe.slice(datasetStart, datasetStop + 1));

    const y = props.volt_curr.slice(datasetStart, datasetStop + 1);

    let corrarr = [];

    for (let i = 0; i < x.length; i++) {
      // Calculate the mean of x and y
      const xMean = x[i].reduce((acc, val) => acc + val) / x[i].length;
      const yMean = y.reduce((acc, val) => acc + val) / y.length;

      // Calculate the standard deviation of x and y
      const xStd = Math.sqrt(
        x[i].reduce((acc, val) => acc + (val - xMean) ** 2) / x[i].length
      );
      const yStd = Math.sqrt(
        y.reduce((acc, val) => acc + (val - yMean) ** 2) / y.length
      );

      // Calculate the correlation coefficient
      let correlation = 0;
      for (let j = 0; j < x[i].length; j++) {
        correlation += (x[i][j] - xMean) * (y[j] - yMean);
      }
      correlation /= x[i].length * xStd * yStd;

      correlation = Math.abs(correlation);
      corrarr.push(correlation);
    }

    for (let i = 0; i < corrarr.length; i++) {
      if (corrarr[i] >= 0.3) {
        corrarr[i] = "HIGH";
      } else if (corrarr[i] < 0.3 && corrarr[i] >= 0.1) {
        corrarr[i] = "MEDIUM";
      } else {
        corrarr[i] = "LOW";
      }
    }

    return corrarr;
  }

  function setStartStop(value) {
    if (inputCounter % 2 === 0) {
      setStartValue(value);
    } else {
      setStopValue(value);
    }
    inputCounter++;
  }

  function pickDataRange(phase) {
    if (!phase.length) {
      return {
        start: 0,
        stop: props.x_axis.length - 1,
      };
    }
    return {
      start: phase[0],
      stop: phase[phase.length - 1],
    };
  }

  const datasetsMap = {
    energyConsumption: {
      title: "Energy Consumption",
      datasets: [
        {
          label: "BAT_Volt x BAT_Curr",
          data: props.volt_curr.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
      ],
    },
    throttle: {
      title: "Throttle",
      datasets: [
        {
          label: "RCOU_C9",
          data: props.rcou_c9.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
      ],
    },
    altitude: {
      title: "Altitude",
      datasets: [
        {
          label: "QTUN_dalt",
          data: props.qtun_dalt.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
        {
          label: "QTUN_alt",
          data: props.qtun_alt.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#006442",
          borderColor: "#006442",
          borderWidth: 1,
        },
      ],
    },
    climbRate: {
      title: "Climb Rate",
      datasets: [
        {
          label: "BARO_CRt",
          data: props.baro_crt.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
        {
          label: "TECS_dh",
          data: props.tecs_dh.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#006442",
          borderColor: "#006442",
          borderWidth: 1,
        },
      ],
    },
    airspeed: {
      title: "Aircraft Speed",
      datasets: [
        {
          label: "ARSP_Airspeed",
          data: props.arsp_arsp.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
      ],
    },
    pitch: {
      title: "Pitch",
      datasets: [
        {
          label: "CTUN_NavPitch",
          data: props.ctun_nvap.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
      ],
    },
    roll: {
      title: "Roll",
      datasets: [
        {
          label: "ATT_DesRoll",
          data: props.att_desroll.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
        {
          label: "ATT_Roll",
          data: props.att_roll.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#006442",
          borderColor: "#006442",
          borderWidth: 1,
        },
      ],
    },
    yaw: {
      title: "Yaw",
      datasets: [
        {
          label: "ATT_DesYaw",
          data: props.att_desyaw.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
        {
          label: "ATT_Yaw",
          data: props.att_yaw.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#006442",
          borderColor: "#006442",
          borderWidth: 1,
        },
      ],
    },
    rudder: {
      title: "Rudder",
      datasets: [
        {
          label: "CTUN_RdrOut",
          data: props.ctun_rdr.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
      ],
    },
    aoaAngle: {
      title: "AOA and SSA",
      datasets: [
        {
          label: "AOA_AOA",
          data: props.aoa_aoa.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
        {
          label: "AOA_SSA",
          data: props.aoa_ssa.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#006442",
          borderColor: "#006442",
          borderWidth: 1,
        },
      ],
    },
    windSpeed: {
      title: "Wind Speed",
      datasets: [
        {
          label: "NKF_VWN",
          data: props.nkf_vwn.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
        {
          label: "NKF_VWE",
          data: props.nkf_vwe.slice(datasetStart, datasetStop + 1),
          fill: false,
          backgroundColor: "#006442",
          borderColor: "#006442",
          borderWidth: 1,
        },
      ],
    },
  };

  const handleComputeTimeRange = () => {
    const res = [];
    let startTime = new Number(startValue);
    let stopTime = new Number(stopValue);
    for (var i = 0; i < props.time_us.length; i++) {
      if (props.time_us[i] >= startTime && props.time_us[i] <= stopTime) {
        res.push(i);
      }
    }
    setPhase(res);
  };

  const renderMap = () => {
    let positions = [];
    let timestamps = [];
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        props.x_axis[datasetStart],
        props.y_axis[datasetStart],
        props.z_axis[datasetStart]
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-15.0),
      },
    });

    // TODO:
    // Define the flight path as an array of Cartesian3 positions with altitude
    var pathColors = props.path_color;
    for (let i = datasetStart; i <= datasetStop; i++) {
      timestamps.push(props.time_us[i]);
      positions.push(
        Cesium.Cartographic.fromDegrees(
          props.x_axis[i],
          props.y_axis[i],
          props.z_axis[i]
        )
      );
    }
    positions =
      Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(positions);
    viewer.entities.removeAll();
    // Add a PolylineVolume entity for each flight path
    const slicedPathColor = pathColors.slice(datasetStart, datasetStop + 1);
    for (let i = 0; i < positions.length; i += 3) {
      let j = i == 0 ? 1 : i;
      let avrred = 0;
      let avrgreen = 0;
      let red_zero =
        slicedPathColor[j] < 50
          ? 1 - (2 * (slicedPathColor[j] - 50)) / 100.0
          : 1.0;
      let red_one =
        slicedPathColor[j + 1] < 50
          ? 1 - (2 * (slicedPathColor[j + 1] - 50)) / 100.0
          : 1.0;
      let red_two =
        slicedPathColor[j + 2] < 50
          ? 1 - (2 * (slicedPathColor[j + 2] - 50)) / 100.0
          : 1.0;
      let green_zero =
        slicedPathColor[j] < 50 ? 1.0 : (2 * slicedPathColor[j]) / 100.0;
      let green_one =
        slicedPathColor[j + 1] < 50
          ? 1.0
          : (2 * slicedPathColor[j + 1]) / 100.0;
      let green_two =
        slicedPathColor[j + 2] < 50
          ? 1.0
          : (2 * slicedPathColor[j + 2]) / 100.0;

      avrred = (red_zero + red_one + red_two) / 3;
      avrgreen = (green_zero + green_one + green_two) / 3;

      let pos =
        i + 3 > positions.length
          ? positions.slice(j - 1, positions.length)
          : positions.slice(j - 1, j + 3);

      let color = Cesium.Color.fromBytes(avrred * 255, avrgreen * 255, 0);

      let flightPath = viewer.entities.add({
        polylineVolume: {
          positions: pos,
          shape: computeCircle(2.5),
          material: color,
        },
      });
      viewer.zoomTo(flightPath);
    }

    viewer.scene.primitives._primitives =
      viewer.scene.primitives._primitives.slice(0, 1);

    const labelCollection = new Cesium.LabelCollection();
    viewer.scene.primitives.add(labelCollection);
    for (let i = 0; i < timestamps.length; i++) {
      let selectedTime = timestamps[i];
      const label = selectedTime.toFixed(2).toString();
      const labelPosition = Cesium.Cartesian3.add(
        positions[i],
        new Cesium.Cartesian3(15, 0, 20),
        new Cesium.Cartesian3()
      );
      labelCollection.add({
        position: labelPosition,
        text: label,
        font: "24px sans-serif",
        fillColor: Cesium.Color.WHITE,
        pixelOffset: new Cesium.Cartesian2(0, -10),
      });
    }

    // Handle the click event on the PolylineVolume entity
    viewer.screenSpaceEventHandler.setInputAction(function (click) {
      var pickedObject = viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject)) {
        var position = viewer.scene.pickPosition(click.position);
        let mindis = -1;
        let min_x = 0;
        let min_y = 0;
        let min_z = 0;
        let min_ind = 0;
        for (var i = 0; i < positions.length; i++) {
          let rawPo = positions[i];
          let comparedis = Math.sqrt(
            Math.pow(rawPo.x - position.x, 2) +
              Math.pow(rawPo.y - position.y, 2) +
              Math.pow(rawPo.z - position.z, 2)
          );
          if (comparedis < mindis && mindis != -1) {
            mindis = comparedis;
            min_x = rawPo.x;
            min_y = rawPo.y;
            min_z = rawPo.z;
            min_ind = i;
          } else if (mindis == -1) {
            mindis = comparedis;
            min_x = rawPo.x;
            min_y = rawPo.y;
            min_z = rawPo.z;
            min_ind = i;
          }
        }

        setStartStop(timestamps[min_ind].toFixed(2));
        // alert("Time is " + timestamps[min_ind].toFixed(2) + " s");
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    setCounter(counter + 1);
  };

  useEffect(() => {
    if (checkpointRef.current) {
      return;
    }
    checkpointRef.current = true;
    window.CESIUM_BASE_URL = "/cesium";
    var newViewer = new Cesium.Viewer("cesiumContainer");
    setViewer(newViewer);
  }, []);

  useEffect(() => {
    if (viewer) {
      renderMap();
    }
  }, [viewer, datasetStart, datasetStop]);

  useEffect(() => {
    const { start, stop } = pickDataRange(phase);
    setDatasetStart(start);
    setDatasetStop(stop);
    setCorrelation(corrcal());
  }, [phase]);

  return (
    <div>
      <div id="cesiumContainer" class="map-container"></div>
      <div id="toolbar"></div>

      <div>
        <Paper
          elevation={3}
          sx={{
            textAlign: "center",
            p: 4,
            height: "5vh",
            backgroundColor: "#c5fad3",
          }}
        >
          <TextField
            sx={{ mr: 5 }}
            id="outlined-basic"
            label="Time Start (sec)"
            variant="outlined"
            value={startValue}
            onChange={handleTextChangeStart}
          />
          <TextField
            sx={{ mr: 5 }}
            id="outlined-basic"
            label="Time End (sec)"
            variant="outlined"
            value={stopValue}
            onChange={handleTextChangeEnd}
          />
          <Button
            sx={{ backgroundColor: "#037aa6" }}
            variant="contained"
            size="large"
            endIcon={<KeyboardDoubleArrowRightIcon />}
            onClick={handleComputeTimeRange}
          >
            <b>Compute</b>
          </Button>
        </Paper>
      </div>

      <Paper
        elevation={3}
        sx={{
          textAlign: "start",
          p: 5,
          height: "30vh",
          backgroundColor: "#c5fad310",
        }}
      >
        <Grid container sx={{ display: "flex" }}>
          <Grid
            item
            xs={6}
            sx={{ display: "flex", flexWrap: "wrap", width: "50%" }}
          >
            {groups.map((each, index) => {
              return (
                <Grid item xs={2}>
                  <GroupFactors
                    topic={each.topic}
                    color={each.color}
                    data={each.data}
                  ></GroupFactors>
                </Grid>
              );
            })}
          </Grid>
          <Grid item xs={1}>
            <Stack
              direction="row"
              sx={{
                ml: 2,
                height: "100%",
                alignItems: "center",
              }}
            >
              <Button
                id="demo-positioned-button"
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                variant="contained"
                size="large"
                endIcon={<KeyboardArrowDownIcon />}
              >
                <b>Select</b>
              </Button>
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                <MenuItem onClick={() => handleSelect("energyConsumption")}>
                  Energy Consumption
                </MenuItem>
                <MenuItem onClick={() => handleSelect("throttle")}>
                  Throttle
                </MenuItem>
                <MenuItem onClick={() => handleSelect("altitude")}>
                  Altitude
                </MenuItem>
                <MenuItem onClick={() => handleSelect("climbRate")}>
                  Climb Rate
                </MenuItem>
                <MenuItem onClick={() => handleSelect("airspeed")}>
                  Airspeed
                </MenuItem>
                <MenuItem onClick={() => handleSelect("pitch")}>Pitch</MenuItem>
                <MenuItem onClick={() => handleSelect("roll")}>Roll</MenuItem>
                <MenuItem onClick={() => handleSelect("yaw")}>Yaw</MenuItem>
                <MenuItem onClick={() => handleSelect("rudder")}>
                  Rudder
                </MenuItem>
                <MenuItem onClick={() => handleSelect("aoaAngle")}>
                  Pitch&Roll Angle
                </MenuItem>
                <MenuItem onClick={() => handleSelect("windSpeed")}>
                  Wind Speed
                </MenuItem>
              </Menu>
            </Stack>
          </Grid>
          <Grid item xs={5}>
            <Container
              sx={{
                textAlign: "center",
              }}
            >
              <b>Graph : {showTitleGraph}</b>
              {showGraph}
            </Container>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}

export async function getServerSideProps(context) {
  let x_axis = [];
  let y_axis = [];
  let z_axis = [];
  let path_color = [];
  let time_us = [];
  let rcou_c9 = [];
  let qtun_dalt = [];
  let qtun_alt = [];
  let tecs_dh = [];
  let baro_crt = [];
  let arsp_arsp = [];
  let ctun_nvap = [];
  let att_desroll = [];
  let att_roll = [];
  let att_yaw = [];
  let att_desyaw = [];
  let ctun_rdr = [];
  let aoa_aoa = [];
  let aoa_ssa = [];
  let nkf_vwn = [];
  let nkf_vwe = [];
  let volt_curr = [];
  let countData = 0;

  const { id } = context.query;
  if (!id) {
    return {
      redirect: "/404",
      permanent: false,
    };
  }

  try {
    let data = await fs.readFile(
      `python_file/data/data_to_web/${id}.csv`,
      "utf8"
    );
    data = data.replaceAll(/^\uFEFF/gm, "").replaceAll(/^\u00BB\u00BF/gm, "");
    const result = await csv(data);
    let arrlen = result.length / 800;

    for (const row of result) {
      if (countData === 0) {
        x_axis.push(Number(row["GPS_Lng"]));
        y_axis.push(Number(row["GPS_Lat"]));
        z_axis.push(Number(row["GPS_Alt"]));
        path_color.push(String(row["Color_on_Path"]));
        time_us.push(Number(row["TimeUS"]));
        rcou_c9.push(Number(row["RCOU_C9"]));
        qtun_dalt.push(Number(row["QTUN_DAlt"]));
        qtun_alt.push(Number(row["QTUN_Alt"]));
        tecs_dh.push(Number(row["TECS_dh"]));
        baro_crt.push(Number(row["BARO_CRt"]));
        arsp_arsp.push(Number(row["ARSP_Airspeed"]));
        ctun_nvap.push(Number(row["CTUN_NavPitch"]));
        att_desroll.push(Number(row["ATT_DesRoll"]));
        att_roll.push(Number(row["ATT_Roll"]));
        att_yaw.push(Number(row["ATT_Yaw"]));
        att_desyaw.push(Number(row["ATT_DesYaw"]));
        ctun_rdr.push(Number(row["CTUN_RdrOut"]));
        aoa_aoa.push(Number(row["AOA_AOA"]));
        aoa_ssa.push(Number(row["AOA_SSA"]));
        nkf_vwn.push(Number(row["NKF2_VWN"]));
        nkf_vwe.push(Number(row["NKF2_VWE"]));
        volt_curr.push(Number(row["Volt_x_Curr"]));
        countData = arrlen.toFixed(0);
      } else {
        countData = countData - 1;
      }
    }
    return {
      props: {
        is_valid: true,
        x_axis,
        y_axis,
        z_axis,
        path_color,
        time_us,
        rcou_c9,
        qtun_dalt,
        qtun_alt,
        tecs_dh,
        baro_crt,
        arsp_arsp,
        ctun_nvap,
        att_desroll,
        att_roll,
        att_yaw,
        att_desyaw,
        ctun_rdr,
        aoa_aoa,
        aoa_ssa,
        nkf_vwn,
        nkf_vwe,
        volt_curr,
      }, // will be passed to the page component as props
    };
  } catch (error) {
    return {
      props: {
        is_valid: false,
      }
    };
  }
}
