import { Grid, Paper, Typography } from "@mui/material";

export default function GroupFactors(props) {
    return (
        <Paper elevation={3} sx={{
            my: 5,
            textAlign: 'start',
            p: 4,
        }}>
            <Grid container mb={2}>
                <Grid item xs={8}>
                    <b>{props.topic}</b>
                </Grid>
                <Grid item xs={4}>
                    <b>Status</b>
                </Grid>
            </Grid>
            {
                props.data.map((each, index) => {
                    return (
                        <Grid container mb={1}>
                            <Grid item xs={8}>
                                {each.key}
                            </Grid>
                            <Grid item xs={4}>
                                {each.value}
                            </Grid>
                        </Grid>
                    )
                })
            }

        </Paper>
    )

}