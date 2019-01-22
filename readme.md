# Introduction

An node express.js engine I wrote to merge one or more base64-encoded PDFs and subsequently pipe the raw binary result stream back to the caller. Password-protected PDFs are supported and there is alternately a linux AlpineOS dockerfile to build the app into a lightweight docker image for easy use in the cloud (it's up you you to secure the traffic via nginx or iis/azure reverse proxy)

I saw a need for this since some systems are not capable of native PDF document merging. If your system however can base64-encode binary data and can make http POST calls, you can use this utility to perform the merging for you.

# Installation Instructions

Since this app uses the node module "pdf-merge", please refer to https://github.com/wubzz/pdf-merge for environment setup (that module uses pdftk under the hood to perform the merging). If running from a docker container, simply build the docker image (see the comments at the bottom of the dockerfile).

The app is written in typescript so be sure your dev toolchain is set up accordingly. 

# Environment variables

The app uses two envirovment variables:
* EXPRESS_PORT: default is "3000"
* EXPRESS_REQUEST_LIMIT: default is "50mb"

# Usage

HTTP POST {server}:{port}/mergepdf

* HTTP Request body sample ("base64data" is required for every array element and cannot be blank. "inputPw" is optional - omit this member if file is not password protected. There needs to be at least one element in the http request JSON object array):
```
[
    {
        "base64data": "base64-encoded data for file 1",
        "inputPw": "password for file 1"
    },
    {
        "base64data": "base64-encoded data for file 2",
        "inputPw": "password for file 2"
    },
    {
        ...
    }
]
```
* HTTP response is returned as a raw byte-stream of the merged output PDF. 

# Docker notes

Dockerhub URL:
https://hub.docker.com/r/skrisjanovs1/pdf-merge-expressjs

Github repository URL: 
https://github.com/steve-krisjanovs/pdf-merge-expressjs

Run container with defaults (50mb http post limit):
`docker run -p 3000:3000 skrisjanovs1/pdf-merge-expressjs:latest`

Run container with 100mb http post limit:
`docker run -e EXPRESS_REQUEST_LIMIT='100mb' -p 3000:3000 skrisjanovs1/pdf-merge-expressjs:latest`