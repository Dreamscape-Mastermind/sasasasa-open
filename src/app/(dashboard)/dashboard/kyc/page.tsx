"use client";
import { useState } from "react";
import { Shield, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/FileUpload";
import toast from 'react-hot-toast';
import Link from "next/link";
import { usePayouts } from "@/hooks/usePayouts";
import { useRouter } from "next/navigation";
import type { KycStatus, KycIdType, PayoutProfile } from "@/types/payouts";

interface KYCFormData {
  idType: string;
  idNumber: string;
  idFrontPhoto: File | null;
  selfiePhoto: File | null;
  termsAccepted: boolean;
}

const KYC = () => {
  const [formData, setFormData] = useState<KYCFormData>({
    idType: "",
    idNumber: "",
    idFrontPhoto: null,
    selfiePhoto: null,
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof KYCFormData, string>>>({});
  const { useUpdatePayoutProfile } = usePayouts();
  const { mutate: updateProfile, isPending: isSubmitting } = useUpdatePayoutProfile();
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof KYCFormData, string>> = {};

    if (!formData.idType) newErrors.idType = "ID type is required";
    if (!formData.idNumber.trim()) newErrors.idNumber = "ID number is required";
    if (!formData.idFrontPhoto) newErrors.idFrontPhoto = "ID front photo is required";
    if (!formData.selfiePhoto) newErrors.selfiePhoto = "Selfie photo is required";
    if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const mappedIdType: KycIdType = formData.idType === 'passport' ? 'Passport' : 'ID';
      const form = new FormData();
      form.append('kyc_id_type', mappedIdType);
      form.append('kyc_id_number', formData.idNumber);
      if (formData.idFrontPhoto) form.append('kyc_id_front_image', formData.idFrontPhoto);
      if (formData.selfiePhoto) form.append('kyc_selfie_with_id_image', formData.selfiePhoto);
      form.append('accepted_terms', String(formData.termsAccepted));
      form.append('kyc_status', 'Pending');

      updateProfile(form, {
        onSuccess: () => {
          toast.success("Your verification documents have been submitted successfully.");
          router.push('/dashboard/payouts');
        },
        onError: () => {
          toast.error("There was an error submitting your documents. Please try again.");
        }
      });
    }
  };

  const updateFormData = (field: keyof KYCFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const renderForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>ID Type</Label>
          <Select value={formData.idType} onValueChange={(value) => updateFormData('idType', value)}>
            <SelectTrigger className={errors.idType ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select ID type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="national-id">National ID Card</SelectItem>
            </SelectContent>
          </Select>
          {errors.idType && <p className="text-destructive text-sm">{errors.idType}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="idNumber">ID Number</Label>
          <Input
            id="idNumber"
            value={formData.idNumber}
            onChange={(e) => updateFormData('idNumber', e.target.value)}
            className={errors.idNumber ? 'border-destructive' : ''}
          />
          {errors.idNumber && <p className="text-destructive text-sm">{errors.idNumber}</p>}
        </div>
      </div>

      <FileUpload
        label="ID Front Photo"
        accept="image/*"
        onFileSelect={(file) => updateFormData('idFrontPhoto', file)}
        error={errors.idFrontPhoto}
        maxSize={5}
      />

      <FileUpload
        label="Selfie Photo"
        accept="image/*"
        onFileSelect={(file) => updateFormData('selfiePhoto', file)}
        error={errors.selfiePhoto}
        maxSize={5}
      />

      <Card className="border-info/20 bg-info/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
            <div className="text-sm text-info-foreground">
              <p className="font-medium mb-2">Photo Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Clear, high-quality images</li>
                <li>All text and details must be clearly visible</li>
                <li>No glare, shadows, or obstructions</li>
                <li>ID must be flat and fully visible</li>
                <li>Selfie should show your face clearly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => updateFormData('termsAccepted', checked)}
            />
            <div className="space-y-2">
              <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to the Terms of Service and Privacy Policy
              </Label>
              <p className="text-xs text-muted-foreground">
                By checking this box, you agree to our terms of service and confirm that the information provided is accurate and complete.
              </p>
            </div>
          </div>
          {errors.termsAccepted && <p className="text-destructive text-sm mt-2">{errors.termsAccepted}</p>}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/dashboard/payouts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payouts
          </Link>
        </div>

                  <Card className="shadow-card border-0">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl font-bold">Identity Verification</CardTitle>
              <CardDescription className="text-lg">
                Complete your KYC verification to unlock full access to our platform. 
                Your information is secure and encrypted.
              </CardDescription>
            </CardHeader>

          <CardContent className="px-8 pb-8">
            <div className="mb-8">
              {renderForm()}
            </div>

            <div className="flex justify-center">
              <Button variant="default" onClick={handleSubmit} className="min-w-32" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : <><CheckCircle className="w-4 h-4 mr-2" />Submit Verification</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KYC;