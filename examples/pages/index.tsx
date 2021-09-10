import React, { useEffect } from "react"
import Head from "next/head"
import { Header } from "../components/header"
import MD from "../content/index.md"
import { Footer } from "../components/footer"

export default function Index() {
    return (
        <div className="d-flex flex-column fullscreen">
            <Head>
                <title>Coconut XR</title>
                <meta
                    name="description"
                    content="At Coconut XR we bring 3D to the Web, Augmented Reality (AR), Virtual Reality (VR) and XR / WebXR. We connect people and business using the latest collaboration and multiuser technologies with a strong background in cloud and distributed development. With many years of experience in software development and fresh ideas we thrive to build the applications of the future."></meta>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="icon" type="image/svg+xml" href="/res/icon.svg" />
                <link rel="mask-icon" href="/res/icon.svg" color="#fff" />
            </Head>
            <Header selectedIndex={-1} />
            <div className="container-lg p-3">
                <MD />
            </div>
            <Footer />
        </div>
    )
}
