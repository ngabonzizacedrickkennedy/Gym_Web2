
package com.sheshape.dto.order;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {

    @NotNull(message = "Payment method is required")
    private String paymentMethod; // CREDIT_CARD, DEBIT_CARD, PAYPAL, etc.

    // Customer Information
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String customerEmail;

    @Pattern(regexp = "^[+]?[0-9\\s\\-()]+$", message = "Invalid phone number format")
    private String customerPhone;

    // Shipping Address
    @NotBlank(message = "Shipping address is required")
    private String shippingAddressLine1;

    private String shippingAddressLine2;

    @NotBlank(message = "City is required")
    private String shippingCity;

    @NotBlank(message = "State is required")
    private String shippingState;

    @NotBlank(message = "Postal code is required")
    private String shippingPostalCode;

    @NotBlank(message = "Country is required")
    private String shippingCountry;

    // Billing Address (optional, can be same as shipping)
    private boolean sameBillingAddress = true;

    private String billingAddressLine1;
    private String billingAddressLine2;
    private String billingCity;
    private String billingState;
    private String billingPostalCode;
    private String billingCountry;

    // Payment Details (for card payments)
    private PaymentDetails paymentDetails;

    private String notes;
}