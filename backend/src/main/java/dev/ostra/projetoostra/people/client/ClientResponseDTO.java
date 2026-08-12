package dev.ostra.projetoostra.people.client;

import java.math.BigDecimal;
import java.util.UUID;

public record ClientResponseDTO(
        UUID id,
        String name,
        String email,
        String cpf,
        String phone,
        String address,
        BigDecimal totalSpent
) {
}