import { Container, Paper, Grid, Typography } from "@mui/material"
import GroupFactors from "./GroupFactors"
export default function HeadGroup(props) {
    return (

        <Paper elevation={3} sx={{
            my: 5,
            textAlign: 'start',
            p: 5,
        }}>
            <Typography variant='h5'>{props.headTopic}</Typography>
            <Grid container spacing={2} my={5}>
                {
                    props.groupFactors.map((each, index) => {
                        return (
                            <Grid item xs={2}>
                                <GroupFactors topic={each.topic} data={each.data}></GroupFactors>
                            </Grid>
                        )
                    })
                }
            </Grid>
        </Paper>
    )
}