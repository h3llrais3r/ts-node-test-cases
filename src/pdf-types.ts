/**
 * List of types we manually created to interact with PdfMake as it does not provide good typescript definitions
 * for the server-side code.
 * This is inspired from the @types/pdfmake type definitions for the client-side code.
 */

import fs from 'fs';
const pdf = require('pdfmake');

export type PageSizeType =
  '4A0' | '2A0' | 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8' | 'A9' | 'A10' |
  'B0' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'B7' | 'B8' | 'B9' | 'B10' |
  'C0' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9' | 'C10' |
  'RA0' | 'RA1' | 'RA2' | 'RA3' | 'RA4' |
  'SRA0' | 'SRA1' | 'SRA2' | 'SRA3' | 'SRA4' |
  'EXECUTIVE' | 'FOLIO' | 'LEGAL' | 'LETTER' | 'TABLOID';

export type PageOrientationType = 'portrait' | 'landscape';

export interface DocumentInformation {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
}

export type DocumentHeaderFooterFunction = (currentPage: number, pageCount: number) => DocumentItem;
export type DocumentBackgroundLayerFunction = (currentPage: number) => DocumentItem;

export type ColumnWidth = number | 'auto' | '*' | string;

export type DocumentItem = string | DocumentTextItem |
  DocumentColumnsItem | DocumentTableItem |
  DocumentNumberedListItem | DocumentBulletedListItem | DocumentStackItem |
  DocumentImageItem;

export interface DocumentStyle {
  fontSize?: number;
  bold?: boolean;
  color?: string;
  italic?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

export interface IDocumentItem extends DocumentStyle {
  margin?: number | number[];
  style?: string | string[];
  pageBreak?: 'before' | 'after';
}

export interface DocumentTextItem extends IDocumentItem {
  text: string | DocumentItem[];
}

export interface ColumnInfo {
  width: ColumnWidth;
  text: string;
}

export interface DocumentColumnsItem extends IDocumentItem {
  columns: ColumnInfo[];
  columnGap: number;
}

export interface DocumentTableInfo {
  headerRows: number;
  widths: ColumnWidth[];
  body: DocumentItem[][];
}

export interface DocumentTableItem extends IDocumentItem {
  table: DocumentTableInfo;
}

export interface DocumentNumberedListItem extends IDocumentItem {
  ol: DocumentItem[];
}

export interface DocumentBulletedListItem extends IDocumentItem {
  ul: DocumentItem[];
}

export interface DocumentStackItem extends IDocumentItem {
  stack: DocumentItem[];
}

export interface DocumentImageItem extends IDocumentItem {
  image: string;
  width?: number;
  height?: number;
  fit?: number[];
}

export interface DocumentDefinitions {
  background?: DocumentBackgroundLayerFunction | DocumentItem;
  info?: DocumentInformation;
  header?: DocumentHeaderFooterFunction | DocumentItem;
  footer?: DocumentHeaderFooterFunction | DocumentItem;
  content: DocumentItem[];
  images?: { [key: string]: string };
  styles?: { [key: string]: DocumentStyle };
  pageSize?: PageSizeType;
  pageOrientation?: PageOrientationType;
  pageMargins?: [number, number, number, number];
  defaultStyle?:
  {
    font?: string;
  };
}

export interface FontFamilyTypes {
  normal?: string;
  bold?: string;
  italics?: string;
  bolditalics?: string;
}

interface PdfPrinter {
  createPdfKitDocument(docDefinition: DocumentDefinitions, options?: any): PDFKit.PDFDocument;
}

export class PdfMake {
  public backend: PdfPrinter;

  constructor(fonts: { [name: string]: FontFamilyTypes }) {
    this.backend = new pdf(fonts) as PdfPrinter;
  }

  public createPdf(filename: string, docDefinition: DocumentDefinitions) {
    try {
      const pdfDoc = this.backend.createPdfKitDocument(docDefinition);
      pdfDoc.pipe(fs.createWriteStream(filename));
      pdfDoc.end();

      return true;
    } catch (error) {
      console.error(error);
    }

    return false;
  }
}
