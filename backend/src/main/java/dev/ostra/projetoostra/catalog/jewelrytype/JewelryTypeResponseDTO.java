package dev.ostra.projetoostra.catalog.jewelrytype;

import java.util.UUID;

public record JewelryTypeResponseDTO(
        UUID id,
        String name,
        String description
) {
}