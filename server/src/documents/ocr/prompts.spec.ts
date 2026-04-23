import { DocumentType } from '../enums/document-type.enum';
import { DOCUMENT_TYPE_TITLES } from '../constants/document-type-titles';
import {
  buildDocumentReviewSynthesisPrompt,
  buildUserPrompt,
  parseDocumentReviewResponse,
  parseOcrResponse,
} from './prompts';

describe('document OCR prompts', () => {
  it('provides tailored OCR metadata for every document type', () => {
    for (const documentType of Object.values(DocumentType)) {
      const meta = DOCUMENT_TYPE_TITLES[documentType];
      expect(meta.title).toBeTruthy();
      expect(meta.description).toBeTruthy();
      expect(meta.ocrPurpose).toBeTruthy();
      expect(meta.requiredSections.length).toBeGreaterThan(0);
      expect(meta.requiredSignals.length).toBeGreaterThan(0);
      expect(meta.documentSpecificInstructions).toBeTruthy();
    }
  });

  it('includes protocol core sections in the review prompts', () => {
    const pagePrompt = buildUserPrompt(DocumentType.PROTOCOL, 0, 100, true);
    const synthesisPrompt = buildDocumentReviewSynthesisPrompt(
      DocumentType.PROTOCOL,
      '[]',
    );

    expect(pagePrompt).toContain('OCR purpose');
    expect(synthesisPrompt).toContain('Study synopsis');
    expect(synthesisPrompt).toContain('Safety reporting');
    expect(synthesisPrompt).toContain('Ethical considerations');
    expect(synthesisPrompt).toContain('References');
  });

  it('parses and normalizes richer final review payloads', () => {
    const parsed = parseDocumentReviewResponse(
      JSON.stringify({
        summary: 'Complete protocol with identifiers and ethics sections.',
        detectedTitle: 'A prospective cohort study protocol',
        documentTypeMatch: true,
        titleMatch: true,
        titleMatchConfidence: 0.92,
        issues: ['Missing Signature', 'wrong format'],
        requiredSectionsFound: ['Study synopsis', 'Methods', 'References'],
        missingSections: ['Safety reporting'],
        optionalSectionsFound: ['Appendices', 'Unknown optional'],
        detectedSignals: ['Protocol number', 'Sponsor name', 'Not allowed'],
        reviewNotes: 'No signature block on the protocol cover page.',
        confidence: 0.88,
      }),
      DocumentType.PROTOCOL,
    );

    expect(parsed.documentTypeMatch).toBe(true);
    expect(parsed.titleMatch).toBe(true);
    expect(parsed.issues).toEqual(['missing_signature', 'wrong_format']);
    expect(parsed.requiredSectionsFound).toEqual([
      'Study synopsis',
      'Methods',
      'References',
    ]);
    expect(parsed.missingSections).toContain('Safety reporting');
    expect(parsed.optionalSectionsFound).toEqual(['Appendices']);
    expect(parsed.detectedSignals).toEqual(['Protocol number', 'Sponsor name']);
  });

  it('normalizes page OCR signal labels against the allowed list', () => {
    const parsed = parseOcrResponse(
      JSON.stringify({
        extractedText: 'Sample consent text',
        summary: 'Consent signature page.',
        detectedTitle: 'Participant Informed Consent Form',
        titleMatch: true,
        titleMatchConfidence: 0.83,
        issues: ['illegible signature'],
        detectedSignals: [
          'Study title',
          'participant name field',
          'not-on-allow-list',
        ],
        reviewNotes: 'Participant and witness areas visible.',
        confidence: 0.79,
      }),
      DocumentType.INFORMED_CONSENT_FORM,
    );

    expect(parsed.issues).toEqual(['illegible_signature']);
    expect(parsed.detectedSignals).toEqual([
      'Study title',
      'Participant name field',
    ]);
  });
});
