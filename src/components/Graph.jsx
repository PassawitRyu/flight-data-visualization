import { Line } from "react-chartjs-2";

export const Graph = (props) => {
  const options = {
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
        options={options}
        height="100%"
        data={{
          labels: props.labels,
          datasets: props.datasets,
        }}
      />
    </div>
  );
}