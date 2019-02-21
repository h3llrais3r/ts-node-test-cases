import fs from 'fs';
import htmlPdf, { CreateOptions } from 'html-pdf';
import path from 'path';
import PDFDocument from 'pdfkit';
import { DocumentDefinitions, FontFamilyTypes, PdfMake } from './pdf-types';

class PdfMakeGenerator {

  // Define font files
  private defaultFonts = {
    Roboto: {
      normal: path.join(__dirname, '..', '/fonts/Roboto-Regular.ttf'),
      bold: path.join(__dirname, '..', '/fonts/Roboto-Medium.ttf'),
      italics: path.join(__dirname, '..', '/fonts/Roboto-Italic.ttf'),
      bolditalics: path.join(__dirname, '..', '/fonts/Roboto-MediumItalic.ttf')
    }
  };

  private fonts: { [name: string]: FontFamilyTypes };
  private documentDefinitions: DocumentDefinitions;

  constructor(fonts: { [name: string]: FontFamilyTypes }, documentDefinitions: DocumentDefinitions) {
    this.fonts = fonts || this.defaultFonts;
    this.documentDefinitions = documentDefinitions;
  }

  public generatePdf(filename: string): void {
    const pdfMake = new PdfMake(this.fonts);
    pdfMake.createPdf(filename, this.documentDefinitions);
    console.log('Created pdf: ' + filename);
  }
}

class PdfKitGenerator {

  public generatePdf(filename: string, text: string): void {
    const pdf = new PDFDocument();
    pdf.pipe(fs.createWriteStream(filename));
    pdf.fontSize(25).text(text);
    pdf.end();
    console.log('Created pdf: ' + filename);
  }
}

class Html2PdfGenerator {

  private htmlTemplatePath: string;
  private options: htmlPdf.CreateOptions;

  constructor(htmlTemplatePath: string, options: htmlPdf.CreateOptions) {
    this.htmlTemplatePath = htmlTemplatePath;
    this.options = options;
  }

  public generatePdf(fileName: string, params: Map<string, string>): void {
    htmlPdf.create(this.readAndTransformHtml(params), this.options).toFile(fileName, (err, pdf) => {
      console.log('Created pdf: ' + pdf.filename);
    });
  }

  private readAndTransformHtml(params: Map<string, string>): string {
    let html = fs.readFileSync(this.htmlTemplatePath, 'utf8');
    const image = path.join('file://', __dirname, '..', '/templates/image.png');
    html = html.replace('{{image}}', image);
    params.forEach((value, key) => {
      html = html.replace('{{' + key + '}}', value);
    });
    return html;
  }
}

// Test pdfMake
const docDefinitions: DocumentDefinitions = {
  content: [
    'First paragraph',
    'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines'
  ]
};
new PdfMakeGenerator(null, docDefinitions).generatePdf('pdfs/pdfMakeTs.pdf');

// Test pdfKit
new PdfKitGenerator().generatePdf('pdfs/pdfKitTs.pdf', 'First text');

// Test htmlPdf
const options: CreateOptions = {
  width: '50mm',
  height: '90mm'
};
const params = new Map<string, string>();
params.set('firstName', 'John');
params.set('lastName', 'Doe');
new Html2PdfGenerator('templates/template.html', options).generatePdf('pdfs/htmlPdfTs.pdf', params);
