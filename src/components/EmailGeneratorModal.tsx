import { useState } from 'react';
import { Provider } from '@/types/provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Send, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmailGeneratorModalProps {
  provider: Provider | null;
  open: boolean;
  onClose: () => void;
}

export function EmailGeneratorModal({
  provider,
  open,
  onClose,
}: EmailGeneratorModalProps) {
  const [copied, setCopied] = useState(false);

  if (!provider) return null;

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 14);
  const formattedDeadline = deadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const defaultSubject = `Provider Information Verification Request - ${provider.name}`;
  
  const fieldsToVerify = provider.discrepancies.length > 0
    ? provider.discrepancies.map(d => d.field).join(', ')
    : 'Phone Number, Address, Specialty';

  const defaultBody = `Dear ${provider.name},

We are conducting a routine verification of provider information in our healthcare network directory. As part of our commitment to maintaining accurate records, we kindly request that you verify the following information we have on file.

Current Information on File:
- Name: ${provider.validatedData.name}
- NPI: ${provider.npi}
- Phone: ${provider.validatedData.phone}
- Address: ${provider.validatedData.address.street}, ${provider.validatedData.address.city}, ${provider.validatedData.address.state} ${provider.validatedData.address.zip}
- Specialty: ${provider.validatedData.specialty}
- License Number: ${provider.licenseNumber}

Fields Requiring Verification:
${fieldsToVerify}

Please review the above information and confirm its accuracy or provide updated details by ${formattedDeadline}.

To respond, please reply to this email with any corrections or confirmation that the information is accurate.

If you have any questions, please contact our Provider Relations team at providerrelations@healthcare.example.com or call (800) 555-0123.

Thank you for your prompt attention to this matter.

Best regards,
Provider Data Verification Team
Healthcare Network Services`;

  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    toast({
      title: 'Copied to clipboard',
      description: 'Email content has been copied to your clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    toast({
      title: 'Email sent',
      description: `Verification request sent to ${provider.name}.`,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Verification Email</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={18}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
