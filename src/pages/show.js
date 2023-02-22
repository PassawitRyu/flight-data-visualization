import mapboxgl from 'mapbox-gl';
import React, { useRef, useEffect, useState } from 'react';
import { promises as fs } from 'fs';
import csv from 'neat-csv';
import Carousel from 'react-material-ui-carousel'
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Container, Grid, Paper, Stack, Typography } from '@mui/material';
import GroupFactors from '@/components/GroupFactors';
import HeadGroup from '@/components/HeadGroup';
import { Cesium3DTile } from 'cesium';

// The URL on your server where CesiumJS's static files are hosted.
// window.CESIUM_BASE_URL = '/';

import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyOTEzOTg4ZS1jOTliLTQzNDMtOGEzNy1hY2NlZjU1MmY0MzQiLCJpZCI6MTI0NjIzLCJpYXQiOjE2NzYzNjI0Mzl9.6gEmu5IXcAMGVjAmVbmgo0A3yLU-I28xBCyXRc6CZns'

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

export const options = {
    responsive: true,
    scales: {
        xAxes: [{
            ticks: {
                stepSize: 100,
                autoSkip: false
            }
        }]
    },
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Chart.js Line Chart',
        },
    },
};

export default function ShowMap(props) {

    const checkpointRef = useRef(false);

    const groups = [
        {
            headTopic: "Group 1: Internal Factor of UAV",
            groupFactors: [
                {
                    topic: "Altitude",
                    data: [
                        { key: "Desire Altitude", value: "LOW" },
                        { key: "Altitude", value: "LOW" }
                    ]
                },
                {
                    topic: "Climb Rate",
                    data: [
                        { key: "Current Climb Rate", value: "MEDIUM" },
                        { key: "BARO_CRt", value: "LOW" }
                    ]
                },
                {
                    topic: "Aircraft Speed",
                    data: [
                        { key: "Aircraft Speed", value: "HIGH" }
                    ]
                },
            ]
        },
        {
            headTopic: "Group 2: UAV Flight Formation",
            groupFactors: [
                {
                    topic: "Pitch",
                    data: [
                        { key: "NavPitch", value: "HIGH" }
                    ]
                },
                {
                    topic: "Roll",
                    data: [
                        { key: "Des Roll", value: "MEDIUM" },
                        { key: "Roll", value: "MEDIUM" }
                    ]
                }, {
                    topic: "Yaw",
                    data: [
                        { key: "Yaw", value: "LOW" },
                        { key: "Des Yaw", value: "LOW" }
                    ]
                }, {
                    topic: "Rudder",
                    data: [
                        { key: "Rudder Out", value: "LOW" }
                    ]
                }, {
                    topic: "Pitch Roll Angle",
                    data: [
                        { key: "AOA", value: "HIGH" },
                        { key: "SSA", value: "LOW" }
                    ]
                },
            ]
        },
        {
            headTopic: "Group 3: External Factor",
            groupFactors: [
                {
                    topic: "Wind Speed",
                    data: [
                        { key: "North Wind", value: "LOW" },
                        { key: "East Wind", value: "LOW" }
                    ]
                },
            ]
        },

    ]

    useEffect(() => {
        if (checkpointRef.current) {
            return;
        }
        window.CESIUM_BASE_URL = '/cesium';
        // Create a Cesium Viewer
        var viewer = new Cesium.Viewer('cesiumContainer');

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(props.x_axis[0], props.y_axis[0], props.z_axis[0]),
            orientation: {
                heading: Cesium.Math.toRadians(0.0),
                pitch: Cesium.Math.toRadians(-15.0),
            }
        });

        // Define the flight path as an array of Cartesian3 positions with altitude
        var positions = [
            // Cesium.Cartographic.fromDegrees(-75.59777, 40.03883, 400),
            // Cesium.Cartographic.fromDegrees(-80.03720, 42.61829, 500),
            // Cesium.Cartographic.fromDegrees(-73.77814, 40.64131, 600),
            // Cesium.Cartographic.fromDegrees(-77.03637, 38.89511, 80)
        ];
        for (let i = 0; i < props.x_axis.length; i++) {
            positions.push(Cesium.Cartographic.fromDegrees(props.x_axis[i], props.y_axis[i], props.z_axis[i]));
        }
        positions = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(positions);

        // Create a Polyline entity to represent the flight path
        let flightPath = viewer.entities.add({
            polylineVolume: {
                positions: positions,
                shape: computeCircle(5.0),
                material: Cesium.Color.RED,
            },
        });

        // Handle the click event on the PolylineVolume entity
        viewer.screenSpaceEventHandler.setInputAction(function (click) {
            var pickedObject = viewer.scene.pick(click.position);
            if (Cesium.defined(pickedObject) && pickedObject.id === flightPath) {
                var position = viewer.scene.pickPosition(click.position);
                var cartographic = Cesium.Cartographic.fromCartesian(position);
                var longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
                var latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
                var altitude = cartographic.height.toFixed(2);
                var message = 'Clicked position: (' + longitude + ', ' + latitude + ', ' + altitude + ')';
                alert(message);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Set the camera position and orientation to focus on the flight path
        viewer.zoomTo(flightPath);
        checkpointRef.current = true;
    }, [])

    return (
        <div>

            <div id="cesiumContainer" class="map-container"></div>
            <div id="toolbar"></div>

            <Carousel animation='slide'
                height="40vh"
                indicators={false}
                autoPlay={false}
                navButtonsAlwaysVisible>
                {
                    groups.map((group, index) => {
                        return (

                            <HeadGroup headTopic={group.headTopic} groupFactors={group.groupFactors} />

                        )
                    })
                }
            </Carousel>

            {/* มาใหม่ */}
            {/* <div className="mockupGraph-container">
                <p className='optionBox'>ปัจจัยที่มีผลตลอด</p>
                <p className='optionBox'>ปัจจัยที่มีผลบางเวลา</p>
                <p className='optionBox'>ปัจจัยภายนอก</p>
            </div>
            <div className="mockupGraph-container">
                <div style={{ width: "30%" }}>
                    <Line options={options} data={{
                        labels: props.x_axis,
                        datasets: [
                            {
                                label: '',
                                data: props.y_axis,
                                backgroundColor: 'rgba(178, 222, 39, 1)',
                                borderColor: 'rgba(178, 222, 39, 1)',
                                borderWidth: 1
                            }
                        ]
                    }} />
                </div>
                <div style={{ width: "30%" }}>
                    <Line options={options} data={{
                        labels: props.x_axis,
                        datasets: [
                            {
                                label: '',
                                data: props.y_axis,
                                backgroundColor: 'rgba(4, 59, 92, 1)',
                                borderColor: 'rgba(4, 59, 92, 1)',
                                borderWidth: 1
                            }
                        ]
                    }} />
                </div>
                <div style={{ width: "30%" }}>
                    <Line options={options} data={{
                        labels: props.x_axis,
                        datasets: [
                            {
                                label: '',
                                data: props.y_axis,
                                backgroundColor: 'rgba(8, 14, 44, 1)',
                                borderColor: 'rgba(8, 14, 44, 1)',
                                borderWidth: 1
                            }
                        ]
                    }} />
                </div>
            </div> */}

        </div>
    );
}

// ทำอะไรก่อนส่งหน้าเว็บ
// export async function getServerSideProps(context) {
//     let x_axis = []
//     let y_axis = []
//     let countData = 0
//     let data = await fs.readFile('flightPath/Test2.csv', 'utf8');
//     data = data.replaceAll(/^\uFEFF/gm, "").replaceAll(/^\u00BB\u00BF/gm, "");
//     const result = await csv(data);
//     for (const row of result) {
//         if (countData === 0) {
//             let keys = Object.keys(row)
//             x_axis.push(Number(row['Hello']))
//             y_axis.push(Number(row['BAT_VoltCurr']))
//             countData = 100
//         }
//         else {
//             countData = countData - 1
//         }

//     }
//     // console.log(countData)
//     // console.log(y_axis)
//     // console.log(result)
//     return {
//         props: {
//             x_axis,
//             y_axis
//         }, // will be passed to the page component as props
//     }
// }

export async function getServerSideProps(context) {
    let x_axis = []
    let y_axis = []
    let z_axis = []
    let countData = 0
    let data = await fs.readFile('python_file/data/data_to_web/Complete_data.csv', 'utf8');
    data = data.replaceAll(/^\uFEFF/gm, "").replaceAll(/^\u00BB\u00BF/gm, "");
    const result = await csv(data);
    for (const row of result) {
        if (countData === 0) {
            let keys = Object.keys(row)
            x_axis.push(Number(row['GPS_Lng']))
            y_axis.push(Number(row['GPS_Lat']))
            z_axis.push(Number(row['GPS_Alt']))
            countData = 100
        }
        else {
            countData = countData - 1
        }

    }
    // console.log(countData)
    // console.log(y_axis)
    // console.log(result)
    return {
        props: {
            x_axis,
            y_axis,
            z_axis
        }, // will be passed to the page component as props
    }
}

    // // TO MAKE THE MAP APPEAR YOU MUST
    // // ADD YOUR ACCESS TOKEN FROM
    // // https://account.mapbox.com
    // const mapContainer = useRef(null);
    // const map = useRef(null);
    // const [lng, setLng] = useState(-122.48369693756104);
    // const [lat, setLat] = useState(37.83381888486939);
    // const [zoom, setZoom] = useState(9);

    // useEffect(() => {
    //     if (map.current) return; // initialize map only once
    //     map.current = new mapboxgl.Map({
    //         container: mapContainer.current,
    //         style: 'mapbox://styles/mapbox/streets-v12',
    //         center: [lng, lat],
    //         zoom: zoom,
    //         pitch: 60,
    //         bearing: 20,
    //         accessToken: 'pk.eyJ1Ijoicnl1a2lwdW5pIiwiYSI6ImNsZGNvbHg1ZzBjaGYzcG1pbmJ3cXRuajgifQ.VAMR7bV5v3IsYwI5lmVzjg'
    //     });

    //     map.current.on('load', function () {
    //         map.current.addSource('flightPath', {
    //             "type": "geojson",
    //             "data": flightPath
    //         });

    //         map.current.addLayer({
    //             "id": "flightPath",
    //             "type": "line",
    //             "source": "flightPath",
    //             "paint": {
    //                 "line-color": "#ff0000",
    //                 "line-width": 4,
    //                 "line-opacity": 0.8,
    //                 "line-height": 5
    //             }
    //         });
    //     });
    // });

    // <div ref={mapContainer} className="map-container" />
    // <Line options={options} data={{
    //     labels: props.x_axis,
    //     datasets: [
    //         {
    //             label: '',
    //             data: props.y_axis,
    //             backgroundColor: 'rgba(255, 99, 132, 1)',
    //             borderColor: 'rgba(255, 99, 132, 1)',
    //             borderWidth: 1
    //         }
    //     ]
    // }} />
