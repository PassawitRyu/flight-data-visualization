import { Container, Paper, Grid, Typography } from "@mui/material"
import GroupFactors from "./GroupFactors"
export default function HeadGroup(props) {
    return (
        <Container>
            <Paper elevation={3} sx={{
                my: 5,
                textAlign: 'start',
                p: 4,
            }}>
                <Typography variant='h5'>{props.headTopic}</Typography>
                <Grid container spacing={2}>
                    {
                        props.groupFactors.map((each, index) => {
                            return (
                                <Grid item xs={4}>
                                    <GroupFactors topic={each.topic} data={each.data}></GroupFactors>
                                </Grid>
                            )
                        })
                    }
                </Grid>
            </Paper>
        </Container>
    )
}