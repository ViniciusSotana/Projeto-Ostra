package dev.ostra.projetoostra.sale.jewelrycase;

import dev.ostra.projetoostra.people.seller.Seller;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class JewelryCaseMapper {

    public JewelryCase toEntity(JewelryCaseRequestDTO dto, Seller seller) {
        return new JewelryCase(
                dto.code(),
                dto.description(),
                seller
        );
    }

    public JewelryCaseResponseDTO toDTO(JewelryCase entity) {
        var itemsDTO = entity.getItems().stream()
                .map(item -> new JewelryCaseItemResponseDTO(
                        item.getJewelry().getId(),
                        item.getJewelry().getName(),
                        item.getQuantity()
                ))
                .collect(Collectors.toList());

        return new JewelryCaseResponseDTO(
                entity.getId(),
                entity.getCode(),
                entity.getDescription(),
                entity.getSeller() != null ? entity.getSeller().getId() : null,
                entity.getSeller() != null ? entity.getSeller().getName() : null,
                itemsDTO
        );
    }
}