import { Button, Heading, Link, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, emailColors } from './components/EmailLayout';

interface VerifyEmailProps {
  firstName: string;
  verifyUrl: string;
}

export function VerifyEmail({ firstName, verifyUrl }: VerifyEmailProps) {
  return (
    <EmailLayout preview="Confirm your RNEC Portal email address">
      <Heading
        as="h1"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 24,
          margin: '0 0 12px 0',
          color: emailColors.navy,
        }}
      >
        Confirm your email
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 16px 0' }}>
        Hi {firstName}, welcome to the RNEC Portal. Please confirm your email
        address to activate your researcher account.
      </Text>
      <Button
        href={verifyUrl}
        style={{
          backgroundColor: emailColors.navy,
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 400,
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Verify email address
      </Button>
      <Text style={{ fontSize: 12, color: emailColors.navySoft, margin: '24px 0 0 0' }}>
        Or copy this link into your browser:
        <br />
        <Link href={verifyUrl} style={{ color: emailColors.navySoft }}>
          {verifyUrl}
        </Link>
      </Text>
      <Text style={{ fontSize: 12, color: emailColors.navySoft, margin: '16px 0 0 0' }}>
        This link expires in 24 hours. If you didn&apos;t create an account, you
        can ignore this email.
      </Text>
    </EmailLayout>
  );
}

export default VerifyEmail;
