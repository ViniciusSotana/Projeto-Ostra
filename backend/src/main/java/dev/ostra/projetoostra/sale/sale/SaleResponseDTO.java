package dev.ostra.projetoostra.sale.sale;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SaleResponseDTO(
        UUID id,
        LocalDateTime saleDate,
        BigDecimal totalAmount,
        UUID clientId,
        String clientName,
        UUID sellerId,
        String sellerName,
        String status,
        List<SaleItemResponseDTO> items
) {
}

record SaleItemResponseDTO(
        UUID jewelryId,
        String jewelryName,
        String jewelrySku,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subTotal
) {}