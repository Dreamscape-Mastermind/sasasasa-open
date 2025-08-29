"use client";

import { Building2, CreditCard, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const UpdateFinancialInfoForm = ({ formData, updateFormData, onSubmit, isLoading }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="shadow-medium border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Crypto Wallet */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Crypto Wallet
            </h3>
            <div className="space-y-2">
              <Label htmlFor="wallet-address">Wallet Address</Label>
              <Input
                id="wallet-address"
                type="text"
                placeholder="0xAbc123Def456..."
                value={formData.wallet_address}
                onChange={(e) => updateFormData('wallet_address', e.target.value)}
                className="transition-all duration-300 focus:shadow-soft"
              />
            </div>
          </div>

          {/* Mobile Money */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              Mobile Money
            </h3>
            <div className="space-y-2">
              <Label htmlFor="mobile-money">Mobile Money Number</Label>
              <Input
                id="mobile-money"
                type="tel"
                placeholder="+254712345678"
                value={formData.mobile_money_number}
                onChange={(e) => updateFormData('mobile_money_number', e.target.value)}
                className="transition-all duration-300 focus:shadow-soft"
              />
            </div>
          </div>

          {/* Bank Account */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Bank Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.bank_account_details.account_name}
                  onChange={(e) => updateFormData('bank_account_details.account_name', e.target.value)}
                  className="transition-all duration-300 focus:shadow-soft"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  type="text"
                  placeholder="0123456789"
                  value={formData.bank_account_details.account_number}
                  onChange={(e) => updateFormData('bank_account_details.account_number', e.target.value)}
                  className="transition-all duration-300 focus:shadow-soft"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bank-code">Bank Code</Label>
                <Input
                  id="bank-code"
                  type="text"
                  placeholder="044"
                  value={formData.bank_account_details.bank_code}
                  onChange={(e) => updateFormData('bank_account_details.bank_code', e.target.value)}
                  className="transition-all duration-300 focus:shadow-soft"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Updating...' : 'Update Financial Information'}
      </Button>
    </form>
  );
};
