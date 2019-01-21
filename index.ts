const PDFMerge = require('pdf-merge');
import {Stream} from "stream";
import * as express from "express";
import bodyParser = require("body-parser");
var isBase64 = require('is-base64');
import * as os from "os";
import * as path from "path";
import * as util from "util";
import * as fs from "fs";
const tempfile = require('tempfile');
const magic = require('magic-number');

var writefile_async = util.promisify(fs.writeFile);

class InputFile {
    public file:String;
    public inputPw?:String;
    public constructor(file:String, inputPw?:String) {
        this.file = file;
        this.inputPw = inputPw;
    }
}

enum PdfMergeTarget {
    Buffer,
    Stream,
    File
}

class PdfMerger {
    public static async PdfMergeAsync(inputfiles:Array<InputFile>, returnas:PdfMergeTarget, outputfile?:string):Promise<any>{

        var opts = {output: null};
        if (inputfiles.length == 0)
            throw new Error("inputfiles Array length cannot = 0!")

        var inputFiles2:Array<any> = [];
        for (var i = 0; i < inputfiles.length; i++) {
            var inputfile = inputfiles[i];
            if (inputfile.inputPw == undefined)
                inputFiles2.push({file: inputfile.file});
            else
                inputFiles2.push({file: inputfile.file, inputPw: inputfile.inputPw});
        }

        switch(returnas) {
            case PdfMergeTarget.Buffer:
                opts.output = "Buffer";
                var buff:Buffer = await PDFMerge(inputFiles2, opts); 
                return buff;
            case PdfMergeTarget.Stream:
                opts.output = "Stream";
                var stream:Stream = await PDFMerge(inputFiles2, opts);
                return stream;
            case PdfMergeTarget.File:
                opts.output = outputfile;
                if (outputfile == undefined)
                    throw new Error("outputfile cannot be undefined");
                var buff:Buffer = await PDFMerge(inputFiles2, opts);
                return; 
        }
    }
}

var main = async () => {
    try {

        var app = express();
        
        var express_req_limit = "50mb";
        if (process.env.EXPRESS_REQUEST_LIMIT != null)
            express_req_limit = process.env.EXPRESS_REQUEST_LIMIT;

        app.use(bodyParser.json({limit: express_req_limit }));
        var port = (3000 || process.env.EXPRESS_PORT);
        
        app.listen(port, () => {
            console.log(`express listening on port ${port}...`);
            app.post("/mergepdf", async function(req, res) {

                console.log("HTTP POST '/mergepdf' received...")
                
                var body = req.body;
                
                if (!(body instanceof Array)) {
                    res.status(500).send("http request body must be a JSON object array").end();
                    return;
                }

                var arr:Array<any> = body;
                for (var i = 0; i < arr.length; i++) {
                    var obj = arr[i];
                    if (!obj.hasOwnProperty("base64data")) {
                        res.status(500).send("one or more objects in http request object array is missing 'base64data' property").end();
                        return;
                    }
                    if (!isBase64(obj.base64data, {allowBlank: false})) {
                        res.status(500).send("one or more objects in http request object array has a base64data value that is blank or invalid").end();
                        return;
                    }

                    //validate that the object is a PDF (ignore for now. erroring out in magic module)
                    //var buff:Buffer = Buffer.from(obj.base64data, 'base64');
                    //var type = magic.detectType(buff);
                }
                
                //if this is reached then the payload is good. decode and build array of files to concatenate. 
                var tmpfiles:Array<InputFile> = [];
                for (var i = 0; i < arr.length; i++) {
                    var obj = arr[i];
                    var base64 = obj.base64data;
                    var buff:Buffer = Buffer.from(base64, 'base64');

                    var tmpfile = tempfile(".pdf");
                    var tmppass = undefined;
                    try {
                        
                        await writefile_async(tmpfile, buff);
                    }
                    catch (err) {
                        console.log(err);                        
                        res.status(500).send(`Error creating ${tmpfile}`).end();
                        return;
                    }
                    if (obj.hasOwnProperty("inputPw")) {
                        tmppass = obj.inputPw;
                    }
                    var inputfile = new InputFile(tmpfile,tmppass);
                    tmpfiles.push(inputfile);
                }

                try {
                    var stream:Stream = await PdfMerger.PdfMergeAsync(tmpfiles, PdfMergeTarget.Stream);
                    stream.pipe(res);
                    return;
                }
                catch (err) {
                    console.log(err);
                    res.status(500).send("An error occured when running PdfMerger.PdfMergeAsync(inputfiles, PdfMergeTarget.Stream)").end();
                    return;
                }
                res.sendStatus(200).end();
            });
        });
    }
    catch (err) {
        console.log(err);
    }
};
main();


