package dev.ostra.projetoostra.sale.jewelrycase;

import java.util.List;
import java.util.UUID;

public record JewelryCaseResponseDTO(
        UUID id,
        String code,
        String description,
        UUID sellerId,
        String sellerName,
        List<JewelryCaseItemResponseDTO> items
) {
}

record JewelryCaseItemResponseDTO(
        UUID jewelryId,
        String jewelryName,
        Integer quantity
) {}