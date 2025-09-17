// File 1: CheckoutRequestDto.java
package com.sheshape.dto.order;

import com.sheshape.model.order.Order;
import jakarta.validation.Valid;
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

    @Valid
    @NotNull(message = "Shipping address is required")
    private AddressDto shippingAddress;

    @Valid
    private AddressDto billingAddress;

    private String customerNotes;

    // Payment details (will be encrypted/secured in real implementation)
    private PaymentDetailsDto paymentDetails;
}
