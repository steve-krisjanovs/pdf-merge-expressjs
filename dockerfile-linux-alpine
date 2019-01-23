FROM node:8.15.0-alpine

ENV EXPRESS_PORT=3000
#optional HTTP request max size (default is 50mb if omitted)
#-----------------------------------------------------------
#ENV EXPRESS_REQUEST_LIMIT=50mb

EXPOSE ${EXPRESS_PORT}

WORKDIR /myapp
COPY ./package.json /myapp/package.json
COPY ./tsconfig.json /myapp/tsconfig.json
COPY ./index.ts /myapp/index.ts

#go to myapp dir and finalize install
RUN cd /myapp

#install pdftk package
RUN apk add --update \
    pdftk

#set up node deps
RUN npm install -g typescript
RUN npm install
RUN tsc -p tsconfig.json
CMD ["node","./index.js"]

# NOTES ###########################################################
#to build docker container:
# docker build --rm -f "dockerfile" -t pdf-merge-expressjs:latest .
#
#to run docker container (examples below):
# docker run -p 3000:3000 pdf-merge-expressjs:latest
# docker run -e EXPRESS_REQUEST_LIMIT='100mb' -p 3000:3000 pdf-merge-expressjs:latest
#
###################################################################
