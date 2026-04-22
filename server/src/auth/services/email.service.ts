import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import * as React from 'react';
import { VerifyEmail } from '../emails/VerifyEmail';
import { ResetPassword } from '../emails/ResetPassword';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: Resend | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.client = apiKey ? new Resend(apiKey) : null;
    this.from =
      this.config.get<string>('RESEND_FROM') ?? 'RNEC <noreply@rnec.rw>';
  }

  private async send(
    to: string,
    subject: string,
    element: React.ReactElement,
  ): Promise<void> {
    const html = await render(element);
    if (!this.client) {
      this.logger.warn(
        `RESEND_API_KEY not set — email to <${to}> with subject "${subject}" not sent. Preview:\n${html.slice(0, 400)}...`,
      );
      return;
    }
    try {
      const { error } = await this.client.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });
      if (error) {
        this.logger.error(`Resend error for ${to}: ${JSON.stringify(error)}`);
      }
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err as Error);
    }
  }

  sendVerificationEmail(
    to: string,
    firstName: string,
    verifyUrl: string,
  ): Promise<void> {
    return this.send(
      to,
      'Confirm your RNEC Portal email',
      React.createElement(VerifyEmail, { firstName, verifyUrl }),
    );
  }

  sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetUrl: string,
    expiresMinutes: number,
  ): Promise<void> {
    return this.send(
      to,
      'Reset your RNEC Portal password',
      React.createElement(ResetPassword, {
        firstName,
        resetUrl,
        expiresMinutes,
      }),
    );
  }
}
