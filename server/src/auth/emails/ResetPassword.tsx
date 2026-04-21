import { Button, Heading, Link, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, emailColors } from './components/EmailLayout';

interface ResetPasswordProps {
  firstName: string;
  resetUrl: string;
  expiresMinutes: number;
}

export function ResetPassword({
  firstName,
  resetUrl,
  expiresMinutes,
}: ResetPasswordProps) {
  return (
    <EmailLayout preview="Reset your RNEC Portal password">
      <Heading
        as="h1"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 24,
          margin: '0 0 12px 0',
          color: emailColors.navy,
        }}
      >
        Reset your password
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 16px 0' }}>
        Hi {firstName}, we received a request to reset the password on your RNEC
        Portal account. Click the button below to choose a new one.
      </Text>
      <Button
        href={resetUrl}
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
        Reset password
      </Button>
      <Text
        style={{
          fontSize: 12,
          color: emailColors.navySoft,
          margin: '24px 0 0 0',
        }}
      >
        Or copy this link into your browser:
        <br />
        <Link href={resetUrl} style={{ color: emailColors.navySoft }}>
          {resetUrl}
        </Link>
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: emailColors.navySoft,
          margin: '16px 0 0 0',
        }}
      >
        This link expires in {expiresMinutes} minutes and can only be used once.
        If you didn&apos;t request a password reset, you can safely ignore this
        email — your password won&apos;t change.
      </Text>
    </EmailLayout>
  );
}

export default ResetPassword;
