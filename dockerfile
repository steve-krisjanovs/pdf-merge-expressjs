FROM node:8.15.0-alpine

ENV EXPRESS_PORT=3000
#optional HTTP request max size (default is 50mb if omitted)
#-----------------------------------------------------------
#ENV EXPRESS_REQUEST_LIMIT=50mb

EXPOSE ${EXPRESS_PORT}

WORKDIR /myapp
COPY ./package.json /myapp/package.json
COPY ./index.js /myapp/index.js
COPY ./index.ts ./myapp/index.ts
COPY ./index.js.map /myapp/index.js.map

#go to myapp dir and finalize install
RUN cd /myapp

#install pdftk package
RUN apk add --update \
    pdftk

#set up node deps
RUN npm install -g typescript
RUN npm install
CMD ["node","./index.js"]

# NOTES ###########################################################
#to build docker container:
# docker build --rm -f "dockerfile" -t pdf-merge-expressjs:latest .
#
#to run docker container:
# docker run -p 3000:3000 pdf-merge-expressjs:latest
#
###################################################################
