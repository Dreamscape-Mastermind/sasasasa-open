"use client";
import { useState } from "react";
import { Shield, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/FileUpload";
import toast from 'react-hot-toast';
import Link from "next/link";

interface KYCFormData {
  idType: string;
  idNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  idFrontPhoto: File | null;
  selfiePhoto: File | null;
  termsAccepted: boolean;
}

const KYC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<KYCFormData>({
    idType: "",
    idNumber: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    idFrontPhoto: null,
    selfiePhoto: null,
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof KYCFormData, string>>>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<Record<keyof KYCFormData, string>> = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
      if (!formData.idType) newErrors.idType = "ID type is required";
      if (!formData.idNumber.trim()) newErrors.idNumber = "ID number is required";
    }

    if (currentStep === 2) {
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.country.trim()) newErrors.country = "Country is required";
      if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required";
    }

    if (currentStep === 3) {
      if (!formData.idFrontPhoto) newErrors.idFrontPhoto = "ID front photo is required";
      if (!formData.selfiePhoto) newErrors.selfiePhoto = "Selfie photo is required";
      if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(3)) {
      toast.success("Your verification documents have been submitted successfully. We'll review them within 24-48 hours.");
      // Here you would typically submit to your backend
      console.log("KYC Data:", formData);
    }
  };

  const updateFormData = (field: keyof KYCFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
            stepNumber <= step 
              ? 'bg-trust-primary text-white shadow-trust' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {stepNumber < step ? <CheckCircle className="w-5 h-5" /> : stepNumber}
          </div>
          {stepNumber < 3 && (
            <div className={`w-16 h-1 mx-2 transition-all duration-200 ${
              stepNumber < step ? 'bg-trust-primary' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            className={errors.firstName ? 'border-destructive' : ''}
          />
          {errors.firstName && <p className="text-destructive text-sm">{errors.firstName}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            className={errors.lastName ? 'border-destructive' : ''}
          />
          {errors.lastName && <p className="text-destructive text-sm">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
          className={errors.dateOfBirth ? 'border-destructive' : ''}
        />
        {errors.dateOfBirth && <p className="text-destructive text-sm">{errors.dateOfBirth}</p>}
      </div>

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
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => updateFormData('address', e.target.value)}
          className={errors.address ? 'border-destructive' : ''}
        />
        {errors.address && <p className="text-destructive text-sm">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            className={errors.city ? 'border-destructive' : ''}
          />
          {errors.city && <p className="text-destructive text-sm">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => updateFormData('postalCode', e.target.value)}
            className={errors.postalCode ? 'border-destructive' : ''}
          />
          {errors.postalCode && <p className="text-destructive text-sm">{errors.postalCode}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          value={formData.country}
          onChange={(e) => updateFormData('country', e.target.value)}
          className={errors.country ? 'border-destructive' : ''}
        />
        {errors.country && <p className="text-destructive text-sm">{errors.country}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
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
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-card border-0">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-trust-primary to-trust-secondary rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">Identity Verification</CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              Complete your KYC verification to unlock full access to our platform. 
              Your information is secure and encrypted.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {renderStepIndicator()}

            <div className="mb-8">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="min-w-24"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {step < 3 ? (
                <Button variant="default" onClick={handleNext} className="min-w-24">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button variant="default" onClick={handleSubmit} className="min-w-32">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Verification
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KYC;