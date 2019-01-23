# Introduction

I saw a need to build this tool since some systems are not capable of native PDF document merging. If your system however can base64-encode binary data and can make http POST calls, you can leverage this http server to perform the document merging for you. Written in node.js, it listens on for HTTP POST requests (text/json with base64-encoded PDF data) and joins that PDF data into a single PDF. The resulting stream is then piped back to the http response as a raw binary stream. Reading password-protected PDFs are also supported. 

You can run this stand-alone or as a Docker container. 

Dockerfiles are available in the github for both Linux Alpine and Windows Server Core. It's up you you to secure the traffic via https nginx or iis/azure reverse proxy if secure transport is required. 

See links below for Dockerhub repository URLs. 

# Docker and Github notes

Github repository URL (dockerfiles for both Alpine and Windows Server core are available): 
https://github.com/steve-krisjanovs/pdf-merge-expressjs

Dockerhub URLs (both docker repos built from the same github master repository):
* Alpine OS: https://hub.docker.com/r/skrisjanovs1/pdf-merge-express-alpine
* Windows Server Core: https://hub.docker.com/r/skrisjanovs1/pdf-merge-express-servercore

# Example docker usage

Run container with defaults (50mb http post limit):
`docker run -p 3000:3000 skrisjanovs1/pdf-merge-express-alpine:latest`

Run container with 100mb http post limit:
`docker run -e EXPRESS_REQUEST_LIMIT='100mb' -p 3000:3000 skrisjanovs1/pdf-merge-express-alpine:latest`

# Dev Environment installation instructions when running stand-alone (no docker):

Since this app uses the node module "pdf-merge", please refer to https://github.com/wubzz/pdf-merge for environment setup (that module uses pdftk under the hood to perform the merging). If running from a docker container, simply build the docker image (see the comments at the bottom of the dockerfile).

The app is written in typescript so be sure your dev toolchain is set up accordingly. 

# Environment variables

The app uses two envirovment variables:
* EXPRESS_PORT: default is "3000" (the docker container version is always 3000)
* EXPRESS_REQUEST_LIMIT: default is "50mb"

# HTTP REST Usage

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