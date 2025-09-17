package com.sheshape.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddressDto {

    @Size(max = 50, message = "First name must not exceed 50 characters")
    private String firstName;

    @Size(max = 50, message = "Last name must not exceed 50 characters")
    private String lastName;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Please provide a valid phone number")
    private String phone;

    @NotBlank(message = "Street address is required")
    @Size(max = 255, message = "Street address must not exceed 255 characters")
    private String street;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @NotBlank(message = "ZIP code is required")
    @Size(max = 20, message = "ZIP code must not exceed 20 characters")
    private String zipCode;

    @NotBlank(message = "Country is required")
    @Size(max = 50, message = "Country must not exceed 50 characters")
    private String country;

    // Helper method to convert to formatted address string
    public String toFormattedString() {
        StringBuilder sb = new StringBuilder();
        if (firstName != null && lastName != null) {
            sb.append(firstName).append(" ").append(lastName).append("\n");
        }
        if (street != null) {
            sb.append(street).append("\n");
        }
        if (city != null || state != null || zipCode != null) {
            if (city != null) sb.append(city);
            if (state != null) sb.append(", ").append(state);
            if (zipCode != null) sb.append(" ").append(zipCode);
            sb.append("\n");
        }
        if (country != null) {
            sb.append(country);
        }
        return sb.toString().trim();
    }

    // Helper method to create from formatted string (for reverse operation if needed)
    public static AddressDto fromFormattedString(String formattedAddress) {
        // This is a basic implementation - you might want to make it more robust
        AddressDto dto = new AddressDto();
        if (formattedAddress != null && !formattedAddress.trim().isEmpty()) {
            String[] lines = formattedAddress.split("\n");
            if (lines.length > 0) {
                // First line might contain name
                String[] nameParts = lines[0].split(" ", 2);
                if (nameParts.length == 2) {
                    dto.setFirstName(nameParts[0]);
                    dto.setLastName(nameParts[1]);
                }
            }
            if (lines.length > 1) {
                dto.setStreet(lines[1]);
            }
            if (lines.length > 2) {
                // Parse city, state, zip
                String cityStateZip = lines[2];
                String[] parts = cityStateZip.split(",");
                if (parts.length >= 2) {
                    dto.setCity(parts[0].trim());
                    String[] stateZip = parts[1].trim().split(" ");
                    if (stateZip.length >= 2) {
                        dto.setState(stateZip[0]);
                        dto.setZipCode(stateZip[1]);
                    }
                }
            }
            if (lines.length > 3) {
                dto.setCountry(lines[3]);
            }
        }
        return dto;
    }
}
