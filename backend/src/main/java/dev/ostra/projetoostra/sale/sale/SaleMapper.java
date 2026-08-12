package dev.ostra.projetoostra.sale.sale;

import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
public class SaleMapper {

    public SaleResponseDTO toDTO(Sale entity) {
        var itemsDTO = entity.getItems().stream()
                .map(item -> new SaleItemResponseDTO(
                        item.getJewelry().getId(),
                        item.getJewelry().getName(),
                        item.getJewelry().getSku(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubTotal()
                ))
                .collect(Collectors.toList());

        return new SaleResponseDTO(
                entity.getId(),
                entity.getSaleDate(),
                entity.getTotalAmount(),
                entity.getClient().getId(),
                entity.getClient().getName(),
                entity.getSeller() != null ? entity.getSeller().getId() : null,
                entity.getSeller() != null ? entity.getSeller().getName() : null,
                entity.getStatus(),
                itemsDTO
        );
    }
}