package dev.ostra.projetoostra.catalog.jewelry;

import dev.ostra.projetoostra.catalog.collection.JewelryCollection;
import dev.ostra.projetoostra.catalog.jewelrytype.JewelryType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class JewelryMapper {

    public Jewelry toEntity(JewelryRequestDTO dto, String imageUrl, String imagePublicId, JewelryType type, JewelryCollection collection) {
        Jewelry jewelry = new Jewelry(
                dto.name(),
                dto.sku(),
                dto.description(),
                dto.originalPrice(),
                dto.sellingPrice(),
                dto.stockQuantity(),
                imageUrl,
                imagePublicId,
                type,
                collection
        );

        if (dto.discountValue() != null) {
            jewelry.setDiscountValue(dto.discountValue());
        } else {
            jewelry.setDiscountValue(BigDecimal.ZERO);
        }

        return jewelry;
    }

    public JewelryResponseDTO toDTO(Jewelry entity) {
        return new JewelryResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getSku(),
                entity.getDescription(),
                entity.getOriginalPrice(),
                entity.getSellingPrice(),
                entity.getDiscountValue(),
                entity.getStockQuantity(),
                entity.getImageUrl(),
                entity.getType().getId(),
                entity.getType().getName(),
                entity.getCollection() != null ? entity.getCollection().getId() : null,
                entity.getCollection() != null ? entity.getCollection().getName() : null
        );
    }
}