package com.sheshape.dto.order;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDetailsDto {

    // For credit/debit cards
    @Pattern(regexp = "^[0-9\\s]{13,19}$", message = "Invalid card number format")
    private String cardNumber;

    @Pattern(regexp = "^(0[1-9]|1[0-2])$", message = "Invalid expiry month")
    private String expiryMonth;

    @Pattern(regexp = "^[0-9]{4}$", message = "Invalid expiry year")
    private String expiryYear;

    @Pattern(regexp = "^[0-9]{3,4}$", message = "Invalid CVV")
    private String cvv;

    @Size(max = 100, message = "Card holder name must not exceed 100 characters")
    private String cardHolderName;

    // For digital wallets
    private String walletId;
    private String walletProvider; // PAYPAL, APPLE_PAY, GOOGLE_PAY, etc.

    // For bank transfer
    private String bankAccountNumber;
    private String routingNumber;
    private String bankName;

    // Common fields for billing address (if different from shipping)
    private String billingAddress;
    private String billingCity;
    private String billingState;
    private String billingZipCode;
    private String billingCountry;

    // Helper method to mask card number for logging/display
    public String getMaskedCardNumber() {
        if (cardNumber == null || cardNumber.length() < 4) {
            return "****";
        }
        return "**** **** **** " + cardNumber.substring(cardNumber.length() - 4);
    }

    // Helper method to check if card details are complete
    public boolean isCardDetailsComplete() {
        return cardNumber != null && !cardNumber.trim().isEmpty() &&
                expiryMonth != null && !expiryMonth.trim().isEmpty() &&
                expiryYear != null && !expiryYear.trim().isEmpty() &&
                cvv != null && !cvv.trim().isEmpty() &&
                cardHolderName != null && !cardHolderName.trim().isEmpty();
    }
}