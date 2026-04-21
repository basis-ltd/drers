import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

// Variable fonts from the app (Noto Sans / Playfair Display) aren't safe in
// email clients; fall back to web-safe stacks. Keep the RNEC navy palette.
const navy = '#0d1b2a';
const navySoft = '#415a77';
const light = '#e0e1dd';

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: '#f5f5f4',
          fontFamily: 'Helvetica, Arial, sans-serif',
          margin: 0,
          padding: '32px 0',
          color: navy,
        }}
      >
        <Container
          style={{
            backgroundColor: '#ffffff',
            border: `1px solid ${light}`,
            borderRadius: 8,
            maxWidth: 560,
            margin: '0 auto',
            overflow: 'hidden',
          }}
        >
          <Section
            style={{
              backgroundColor: navy,
              color: '#ffffff',
              padding: '20px 32px',
            }}
          >
            <Text
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 18,
                fontWeight: 400,
                margin: 0,
                letterSpacing: 0.2,
              }}
            >
              RNEC Rwanda
            </Text>
            <Text
              style={{
                fontSize: 12,
                opacity: 0.85,
                margin: '2px 0 0 0',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
              }}
            >
              Research Ethics Review System
            </Text>
          </Section>
          <Section style={{ padding: '28px 32px 8px 32px' }}>{children}</Section>
          <Hr style={{ borderColor: light, margin: '24px 32px 0 32px' }} />
          <Section style={{ padding: '16px 32px 24px 32px' }}>
            <Text style={{ fontSize: 11, color: navySoft, margin: 0 }}>
              © {new Date().getFullYear()} Rwanda National Ethics Committee — Secure
              platform. This is an automated message, please do not reply.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const emailColors = { navy, navySoft, light };
