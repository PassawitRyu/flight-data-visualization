import React, { useRef, useEffect, useState } from "react";
import { Button, Menu, MenuItem, Container } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
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
import { Line } from "react-chartjs-2";

import { promises as fs } from "fs";
import csv from "neat-csv";

export default function ShowChart(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showTitleGraph, setShowTitleGraph] = React.useState("altitude");
  const [showGraph, setShowGraph] = React.useState(null);
  const [displayData, setDisplayData] = useState([]);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const datasetsMap = {
    energyConsumption: {
      title: "Energy Consumption",
      datasets: [
        {
          label: 'BAT_Volt x BAT_Curr',
          data: props.volt_curr,
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
          label: 'RCOU_C9',
          data: props.rcou_c9,
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
          label: 'QTUN_dalt',
          data: props.qtun_dalt,
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
        {
          label: 'QTUN_alt',
          data: props.qtun_alt,
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
          label: 'BARO_CRt',
          data: props.baro_crt,
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
        {
          label: 'TECS_dh',
          data: props.tecs_dh,
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
          label: 'ARSP_Airspeed',
          data: props.arsp_arsp,
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
          label: 'CTUN_NavPitch',
          data: props.ctun_nvap,
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
          label: 'ATT_DesRoll',
          data: props.att_desroll,
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
        {
          label: 'ATT_Roll',
          data: props.att_roll,
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
          label: 'ATT_DesYaw',
          data: props.att_desyaw,
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
        {
          label: 'ATT_Yaw',
          data: props.att_yaw,
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
          label: 'CTUN_RdrOut',
          data: props.ctun_rdr,
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
          label: 'AOA_AOA',
          data: props.aoa_aoa,
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
        {
          label: 'AOA_SSA',
          data: props.aoa_ssa,
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
          label: 'NKF_VWN',
          data: props.nkf_vwn,
          fill: false,
          backgroundColor: "#003171",
          borderColor: "#003171",
          borderWidth: 1,
        },
        {
          label: 'NKF_VWE',
          data: props.nkf_vwe,
          fill: false,
          backgroundColor: "#006442",
          borderColor: "#006442",
          borderWidth: 1,
        },
      ],
    },
  };

  const handleSelect = (selected) => {
    const dataset = datasetsMap[selected];
    setShowTitleGraph(dataset.title);
    setShowGraph(
      <MockupGraph datasets={dataset.datasets} labels={props.timeUS} />
    );
    handleClose();
  };

  async function registerChartPlugin() {
    Chart.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend
    );
    const { default: plugin } = await import("chartjs-plugin-zoom");
    Chart.register(plugin);
  }

  useEffect(() => {
    registerChartPlugin();
    handleSelect("altitude");
  }, [props]);

  return (
    <Container
      sx={{
        my: 10,
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
        <b>Add Chart</b>
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
        <MenuItem onClick={() => handleSelect("energyConsumption")}>Energy Consumption</MenuItem>
        <MenuItem onClick={() => handleSelect("throttle")}>Throttle</MenuItem>
        <MenuItem onClick={() => handleSelect("altitude")}>Altitude</MenuItem>
        <MenuItem onClick={() => handleSelect("climbRate")}>
          Climb Rate
        </MenuItem>
        <MenuItem onClick={() => handleSelect("airspeed")}>Airspeed</MenuItem>
        <MenuItem onClick={() => handleSelect("pitch")}>Pitch</MenuItem>
        <MenuItem onClick={() => handleSelect("roll")}>Roll</MenuItem>
        <MenuItem onClick={() => handleSelect("yaw")}>Yaw</MenuItem>
        <MenuItem onClick={() => handleSelect("rudder")}>Rudder</MenuItem>
        <MenuItem onClick={() => handleSelect("aoaAngle")}>
          Pitch&Roll Angle
        </MenuItem>
        <MenuItem onClick={() => handleSelect("windSpeed")}>
          Wind Speed
        </MenuItem>
      </Menu>

      <Container
        sx={{
          my: 5,
        }}
      >
        <p>Graph : {showTitleGraph}</p>
        {showGraph}
      </Container>
    </Container>
  );
}

function MockupGraph(props) {
  const options1 = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          stepSize: 100,
          display: false,
          autoSkip: false,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: false,
      },
      zoom: {
        pan: {
          enabled: true,
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "xy",
        },
      },
    },
  };

  return (
    <div>
      <Line
        options={options1}
        data={{
          labels: props.labels,
          datasets: props.datasets,
        }}
      />
    </div>
  );
}

export async function getServerSideProps(context) {
  let timeUS = [];
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
  let data = await fs.readFile(
    "python_file/data/data_to_web/Complete_data.csv",
    "utf8"
  );
  data = data.replaceAll(/^\uFEFF/gm, "").replaceAll(/^\u00BB\u00BF/gm, "");
  const result = await csv(data);
  for (const row of result) {
    if (countData === 0) {
      let keys = Object.keys(row);
      timeUS.push(Number(row["TimeUS"]));
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
      countData = 10;
    } else {
      countData = countData - 1;
    }
  }
  return {
    props: {
      timeUS,
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
}
