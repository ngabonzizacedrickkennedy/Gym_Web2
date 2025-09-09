package com.sheshape.dto.order;

import com.sheshape.model.order.Order;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CheckoutRequestDto {

    @NotNull(message = "Payment method is required")
    private Order.PaymentMethod paymentMethod;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String billingAddress;

    private String customerNotes;

    // Payment details (will be encrypted/secured in real implementation)
    private PaymentDetailsDto paymentDetails;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PaymentDetailsDto {
        // For credit/debit cards
        private String cardNumber;
        private String expiryMonth;
        private String expiryYear;
        private String cvv;
        private String cardHolderName;

        // For digital wallets
        private String walletId;
        private String walletProvider; // PAYPAL, APPLE_PAY, GOOGLE_PAY, etc.

        // For bank transfer
        private String bankAccountNumber;
        private String routingNumber;
        private String bankName;

        // Common fields
        private String billingAddress;
        private String billingCity;
        private String billingState;
        private String billingZipCode;
        private String billingCountry;
    }
}