package dev.ostra.projetoostra.people.seller;

import java.math.BigDecimal;
import java.util.UUID;

public record SellerResponseDTO(
        UUID id,
        String name,
        String email,
        String cpf,
        String phone,
        BigDecimal commission,
        BigDecimal commissionRate,
        BigDecimal soldValue,
        Boolean isActive,
        Integer salesCount
) {
}