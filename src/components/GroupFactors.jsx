import { Grid, Paper } from "@mui/material";

export default function GroupFactors(props) {
  return (
    <Paper
      elevation={3}
      sx={{
        textAlign: "start",
        p: 4,
        height: "50%",
        backgroundColor: props.color,
      }}
    >
      <Grid container mb={2}>
        <b>{props.topic}</b>
      </Grid>
      {props.data.map((each, index) => {
        return (
          <Grid
            container
            mb={1}
            sx={{
              color: "#FFFFFF",
              backgroundColor:
                each.value === "LOW"
                  ? "#319131"
                  : each.value === "MEDIUM"
                  ? "#b86500"
                  : "#F44336",
            }}
          >
            <b><i>{each.key}</i></b>
          </Grid>
        );
      })}
    </Paper>
  );
}
