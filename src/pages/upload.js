import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { useRouter } from 'next/router'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    const router = useRouter();
    function upload(e) {
        // Don't refresh current page
        e.preventDefault()

        // Get the selected file
        console.log(e.target.file.files)
        const file = e.target.file.files[0];

        // Create a new FormData object
        var formData = new FormData();

        // Append the file to the FormData object
        formData.append("file", file);

        // Create an XMLHttpRequest object
        var xhr = new XMLHttpRequest();

        // Open the request and set the method and URL
        xhr.open("POST", "upload.php", true);

        // Send the FormData object
        xhr.send(formData);

        // Listen for the request to complete
        xhr.onload = function () {
            if (xhr.status === 200) {
                // The file was successfully uploaded
                console.log("File uploaded successfully!");
            } else {
                // There was an error uploading the file
                console.error("Error uploading file");
            }
        };
    }

    const uploadToServer = async (e) => {
        e.preventDefault()
        const file = e.target.file.files[0];
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/upload", {
            method: "POST",
            body
        })
        router.push("/show");
    };

    return (
        <>
            <h1>File Upload</h1>
            <form onSubmit={uploadToServer}>
                <label for="file">Select a file:</label>
                <input type="file" name="file" id="file" />
                <input type="submit" value="Upload" />
            </form>
        </>
    )
}
