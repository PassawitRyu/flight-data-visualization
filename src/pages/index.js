import React, { useRef, useEffect, useState } from "react";
import { Inter } from "@next/font/google";
import { useRouter } from "next/router";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { CircularProgress, Menu, MenuItem } from "@mui/material";

export default function Home() {
  const router = useRouter();
  const [fileName, setFileName] = React.useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const formRef = useRef();

  const clearFileInput = () => {
    document.getElementById("file").value = "";
    setFileName("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
  };

  const uploadToServer = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fileInput = e.target.file;
    if (!fileInput.files[0]) {
      setErrorMessage("Please select a file to upload.");
      return;
    }
    const file = fileInput.files[0];
    if (
      file.type !== "text/csv" &&
      !file.type.startsWith("application/") &&
      file.type !== "image/svg+xml"
    ) {
      setErrorMessage("Please upload a CSV file.");
      return;
    }
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/upload", {
      method: "POST",
      body,
    });

    const resBody = await response.json();

    if (!resBody.id) {
      return;
    }

    router.push(`/show/${resBody.id}`);

    setLoading(false);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = () => {
    router.push(`/show/03a3a3289a370b8c1f269e25e2a68941`);
    handleClose();
  };

  const handleAlertClose = () => {
    setErrorMessage(null);
  };

  return (
    <>
      <h1>File Upload</h1>
      <form ref={formRef} onSubmit={uploadToServer}>
        <Input
          type="file"
          name="file"
          id="file"
          disableUnderline
          sx={{
            display: "none",
          }}
          inputProps={{
            accept: "text/csv,application/*,image/svg+xml",
          }}
          onChange={handleFileSelect}
        />
        <label htmlFor="file">
          <Button variant="outlined" component="span" sx={{ mr: 5 }}>
            <b>Select a file</b>
          </Button>
        </label>
        <span>{fileName}</span>
        <b>
          {fileName && (
            <IconButton onClick={clearFileInput} sx={{ mr: 5, ml: 2 }}>
              <ClearIcon />
            </IconButton>
          )}
        </b>
        <Button variant="contained" type="submit">
          <b>Upload</b>
        </Button>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            id="review-flight-button"
            justifyContent="center"
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            variant="contained"
            size="large"
            color="secondary"
            sx={{ mt: 5 }}
          >
            <b>Visualization Filght</b>
          </Button>
          <Menu
            id="review-flight-button"
            aria-labelledby="review-flight-button"
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
            <MenuItem onClick={() => handleSelect()}>
              Flight 1
            </MenuItem>
          </Menu>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading > 0 && <CircularProgress sx={{ mt: 10 }} />}
        </div>
      </form>
      {errorMessage && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "30vh",
          }}
        >
          <Alert variant="filled" severity="error" onClose={handleAlertClose}>
            <AlertTitle>
              <b>Error !</b>
            </AlertTitle>
            {errorMessage}
          </Alert>
        </div>
      )}
    </>
  );
}
