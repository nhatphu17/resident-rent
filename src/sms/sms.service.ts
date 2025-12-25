import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private twilioClient: twilio.Twilio | null = null;
  private provider: string;

  constructor(private configService: ConfigService) {
    this.provider = this.configService.get<string>('SMS_PROVIDER') || 'twilio';
    this.initializeProvider();
  }

  private initializeProvider() {
    if (this.provider === 'twilio') {
      const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

      if (accountSid && authToken) {
        this.twilioClient = twilio(accountSid, authToken);
      }
    }
  }

  async sendSms(to: string, message: string): Promise<void> {
    switch (this.provider) {
      case 'twilio':
        await this.sendViaTwilio(to, message);
        break;
      case 'esms':
        await this.sendViaESMS(to, message);
        break;
      case 'zalo':
        await this.sendViaZalo(to, message);
        break;
      default:
        // Mock SMS for development
        console.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
    }
  }

  private async sendViaTwilio(to: string, message: string): Promise<void> {
    if (!this.twilioClient) {
      console.log(`[MOCK SMS - Twilio not configured] To: ${to}, Message: ${message}`);
      return;
    }

    const from = this.configService.get<string>('TWILIO_PHONE_NUMBER');
    if (!from) {
      console.log(`[MOCK SMS - Twilio phone not configured] To: ${to}, Message: ${message}`);
      return;
    }

    try {
      await this.twilioClient.messages.create({
        body: message,
        from,
        to,
      });
      console.log(`SMS sent via Twilio to ${to}`);
    } catch (error) {
      console.error('Error sending SMS via Twilio:', error);
      throw error;
    }
  }

  private async sendViaESMS(to: string, message: string): Promise<void> {
    // TODO: Implement eSMS integration
    console.log(`[MOCK SMS - eSMS] To: ${to}, Message: ${message}`);
  }

  private async sendViaZalo(to: string, message: string): Promise<void> {
    // TODO: Implement Zalo OA integration
    console.log(`[MOCK SMS - Zalo OA] To: ${to}, Message: ${message}`);
  }
}


