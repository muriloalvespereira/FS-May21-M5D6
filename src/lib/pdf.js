import PdfPrinter from "pdfmake";
import { pipeline } from "stream";
import fs from "fs-extra";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import ImageDataURI from "image-data-uri";
import htmlToPdfmake from "html-to-pdfmake";
import jsdom from "jsdom";

const { JSDOM } = jsdom;
const { window } = new JSDOM("");

const convertImageURL = async (imageUrl) => {
  const encodedUrl = await ImageDataURI.encodeFromURL(imageUrl);
  return encodedUrl;
};

const fonts = {
  Roboto: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

export const getPDFReadableStream = async (data, req) => {
  try {
    const asyncPipeline = promisify(pipeline);
    const printer = new PdfPrinter(fonts);
    let encondedImage = await convertImageURL(data[0].imageUrl);

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      // header : `${pdfData.title}`, just playing around
      content: [
        {
          //styling
          text: `${data[0].name}`,
          alignment: "center",
          // margin: [left, top, right, bottom]
          margin: [0, 0, 0, 24],
          fontSize: 24,
          bold: true,
        },
        {
          image: encondedImage,
          fit: [515, 900],
        },
        {
          //convert html into text for pdf maker needs to pass the window to the htmlToPdfmaker when using node
          text: htmlToPdfmake(data[0].description, { window: window }),
          margin: [0, 24, 0, 0],
          fontSize: 16,
          lineHeight: 1.4,
        },
      ],
    };
    const options = {};
    const pdfReadableStream = printer.createPdfKitDocument(
      docDefinition,
      options
    );

    pdfReadableStream.end();
    const path = join(
      dirname(fileURLToPath(import.meta.url)),
      `../../public/pdf/${req.params.productId}.pdf`
    );
    console.log(path, "para o ver path")
    // const path = join(dirname(fileURLToPath(import.meta.url)), "test.pdf")
    await asyncPipeline(pdfReadableStream, fs.createWriteStream(path)); // generatePDFAsync will await for the stream to end before returning
    return path;
  } catch (error) {
    throw error;
  }
};

// export const generatePDFAsync = async data => {
//   const asyncPipeline = promisify(pipeline) // promisify is an utility which is going to transform a function that uses callbacks into a function that uses Promises (and so Async/Await). Pipeline is a function that works with callbacks to connect two or more streams together --> I can promisify pipeline getting back an "asynchronous pipeline"
//   const printer = new PdfPrinter(fonts)

//   const docDefinition = {
//     content: [data.firstName, `Another paragraph, this time a ${data.lastName}`],
//   }
//   const options = {}
//   const pdfReadableStream = printer.createPdfKitDocument(docDefinition, options)

//   pdfReadableStream.end()

//   const path = join(dirname(fileURLToPath(import.meta.url)), "test.pdf")
//   await asyncPipeline(pdfReadableStream, fs.createWriteStream(path)) // generatePDFAsync will await for the stream to end before returning
//   return path
// }
