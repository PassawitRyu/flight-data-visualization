import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";

export const NotValid = () => {
  const router = useRouter();
  return (
    <Container
      sx={{
        mt: 6,
      }}
    >
      <Stack spacing={7}>
        <Box>
          <Typography variant="h4" mb={2}>
            Flight path not valid!
          </Typography>
          <Typography variant="body1">
            Your flight path ID may not existed or still in processing.
          </Typography>
        </Box>
        <Box
          sx={{
            width: "auto",
          }}
        >
          <Stack direction="row" justifyContent="center" spacing={4}>
            <Button
              size="large"
              variant="outlined"
              onClick={() => router.reload()}
            >
              Refresh
            </Button>
            <Button
              size="large"
              variant="outlined"
              onClick={() => router.push("/")}
            >
              Back to upload
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};
