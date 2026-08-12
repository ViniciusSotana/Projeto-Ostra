package dev.ostra.projetoostra.catalog.jewelry;

import java.math.BigDecimal;
import java.util.UUID;

public record JewelryResponseDTO(
        UUID id,
        String name,
        String sku,
        String description,
        BigDecimal originalPrice,
        BigDecimal sellingPrice,
        BigDecimal discountValue,
        Integer stockQuantity,
        String imageUrl,
        UUID typeId,
        String typeName,
        UUID collectionId,
        String collectionName
) {
}